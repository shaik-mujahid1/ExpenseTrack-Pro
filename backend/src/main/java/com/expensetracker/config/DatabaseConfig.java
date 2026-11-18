package com.expensetracker.config;

import com.zaxxer.hikari.HikariConfig;
import com.zaxxer.hikari.HikariDataSource;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;
import org.springframework.core.env.Environment;

import javax.sql.DataSource;
import java.util.Arrays;

@Configuration
public class DatabaseConfig {

    private static final Logger logger = LoggerFactory.getLogger(DatabaseConfig.class);

    private final Environment env;

    public DatabaseConfig(Environment env) {
        this.env = env;
    }

    @Bean
    @Primary
    public DataSource dataSource() {
        boolean isProd = Arrays.asList(env.getActiveProfiles()).contains("prod")
                || "prod".equalsIgnoreCase(env.getProperty("spring.profiles.active"))
                || "prod".equalsIgnoreCase(System.getenv("SPRING_PROFILES_ACTIVE"));

        String databaseUrl = getProperty("DATABASE_URL");
        String springDatasourceUrl = getProperty("spring.datasource.url");
        String springUsername = getProperty("spring.datasource.username");
        String springPassword = getProperty("spring.datasource.password");

        logger.info("Initializing DataSource. Active profile: {}", isProd ? "PRODUCTION (prod)" : "LOCAL/DEFAULT");

        // 1. Try parsing DATABASE_URL (standard for Render / Neon)
        if (databaseUrl != null && !databaseUrl.isBlank()) {
            return configurePostgresFromUrl(databaseUrl);
        }

        // 2. Try spring.datasource.url if it points to PostgreSQL
        if (springDatasourceUrl != null && springDatasourceUrl.startsWith("jdbc:postgresql:")) {
            return configurePostgresFromJdbcUrl(springDatasourceUrl, springUsername, springPassword);
        }

        // 3. If in production, strictly prohibit fallback to H2
        if (isProd) {
            String errorMsg = "CRITICAL CONFIGURATION ERROR: The 'prod' profile is active, but no PostgreSQL configuration was found! "
                    + "Please configure the 'DATABASE_URL' environment variable in Render with your Neon PostgreSQL connection string "
                    + "(e.g., postgresql://user:password@ep-xyz.neon.tech/neondb?sslmode=require). "
                    + "Silent fallback to H2 is disabled in production to protect data.";
            logger.error(errorMsg);
            throw new IllegalStateException(errorMsg);
        }

        // 4. Local development only: Fallback to persistent H2 file database
        logger.info("Local profile active: Initializing local H2 file database...");
        HikariConfig config = new HikariConfig();
        config.setDriverClassName("org.h2.Driver");
        String h2Url = (springDatasourceUrl != null && !springDatasourceUrl.isBlank())
                ? springDatasourceUrl
                : "jdbc:h2:file:./data/expensedb;DB_CLOSE_DELAY=-1;DB_CLOSE_ON_EXIT=FALSE";
        config.setJdbcUrl(h2Url);
        config.setUsername(springUsername != null ? springUsername : "sa");
        config.setPassword(springPassword != null ? springPassword : "");
        config.setMaximumPoolSize(5);
        return new HikariDataSource(config);
    }

    private String getProperty(String key) {
        String val = env.getProperty(key);
        if (val == null || val.isBlank()) {
            val = System.getenv(key);
        }
        if (val != null) {
            val = val.trim();
            if ((val.startsWith("\"") && val.endsWith("\"")) || (val.startsWith("'") && val.endsWith("'"))) {
                val = val.substring(1, val.length() - 1).trim();
            }
        }
        return val;
    }

    private DataSource configurePostgresFromUrl(String rawUrl) {
        logger.info("Configuring PostgreSQL HikariDataSource from DATABASE_URL...");
        try {
            String clean = rawUrl.trim();
            if ((clean.startsWith("\"") && clean.endsWith("\"")) || (clean.startsWith("'") && clean.endsWith("'"))) {
                clean = clean.substring(1, clean.length() - 1).trim();
            }

            if (clean.startsWith("jdbc:")) {
                clean = clean.substring("jdbc:".length());
            }

            if (clean.startsWith("postgresql://")) {
                clean = clean.substring("postgresql://".length());
            } else if (clean.startsWith("postgres://")) {
                clean = clean.substring("postgres://".length());
            }

            String username = null;
            String password = null;
            String host = null;
            int port = 5432;
            String database = "neondb";
            String cleanQuery = "sslmode=require";

            int slashIdx = clean.indexOf('/');
            String authority = slashIdx != -1 ? clean.substring(0, slashIdx) : clean;
            String rest = slashIdx != -1 ? clean.substring(slashIdx + 1) : "";

            int atIdx = authority.lastIndexOf('@');
            String hostPortStr;
            if (atIdx != -1) {
                String userPass = authority.substring(0, atIdx);
                hostPortStr = authority.substring(atIdx + 1);
                int colonIdx = userPass.indexOf(':');
                if (colonIdx != -1) {
                    username = userPass.substring(0, colonIdx);
                    password = userPass.substring(colonIdx + 1);
                } else {
                    username = userPass;
                }
            } else {
                hostPortStr = authority;
            }

            int colonHost = hostPortStr.indexOf(':');
            if (colonHost != -1) {
                host = hostPortStr.substring(0, colonHost);
                try {
                    port = Integer.parseInt(hostPortStr.substring(colonHost + 1));
                } catch (Exception ignored) {}
            } else {
                host = hostPortStr;
            }

            int qIdx = rest.indexOf('?');
            if (qIdx != -1) {
                database = rest.substring(0, qIdx);
                String rawQuery = rest.substring(qIdx + 1);
                StringBuilder qb = new StringBuilder();
                for (String param : rawQuery.split("&")) {
                    if (!param.startsWith("channel_binding=") && !param.startsWith("socketFactory=")) {
                        if (qb.length() > 0) qb.append("&");
                        qb.append(param);
                    }
                }
                if (qb.length() > 0) cleanQuery = qb.toString();
            } else if (!rest.isBlank()) {
                database = rest;
            }

            if (!cleanQuery.contains("sslmode=")) {
                cleanQuery = cleanQuery + (cleanQuery.isEmpty() ? "" : "&") + "sslmode=require";
            }

            String jdbcUrl = "jdbc:postgresql://" + host + ":" + port + "/" + database + "?" + cleanQuery;
            if (!jdbcUrl.contains("socketFactory=")) {
                jdbcUrl += "&socketFactory=com.expensetracker.config.DnsFallbackSocketFactory";
            }

            logger.info("Constructed PostgreSQL JDBC URL for host: {}:{} and database: {}", host, port, database);

            HikariConfig config = new HikariConfig();
            config.setDriverClassName("org.postgresql.Driver");
            config.setJdbcUrl(jdbcUrl);
            config.addDataSourceProperty("socketFactory", "com.expensetracker.config.DnsFallbackSocketFactory");
            if (username != null) config.setUsername(username);
            if (password != null) config.setPassword(password);
            config.setMaximumPoolSize(10);
            config.setMinimumIdle(2);
            config.setIdleTimeout(300000);
            config.setConnectionTimeout(20000);
            config.setMaxLifetime(1200000);
            config.setInitializationFailTimeout(60000);
            config.setPoolName("ExpenseTrack-Neon-Pool");

            return new HikariDataSource(config);
        } catch (Exception e) {
            String msg = "Failed to parse DATABASE_URL into a valid PostgreSQL connection: " + e.getMessage();
            logger.error(msg, e);
            throw new IllegalStateException(msg, e);
        }
    }

    private DataSource configurePostgresFromJdbcUrl(String jdbcUrl, String username, String password) {
        logger.info("Configuring PostgreSQL HikariDataSource from spring.datasource.url...");
        try {
            String finalUrl = jdbcUrl;
            if (!finalUrl.contains("sslmode=")) {
                finalUrl += (finalUrl.contains("?") ? "&" : "?") + "sslmode=require";
            }
            if (!finalUrl.contains("socketFactory=")) {
                finalUrl += "&socketFactory=com.expensetracker.config.DnsFallbackSocketFactory";
            }

            HikariConfig config = new HikariConfig();
            config.setDriverClassName("org.postgresql.Driver");
            config.setJdbcUrl(finalUrl);
            config.addDataSourceProperty("socketFactory", "com.expensetracker.config.DnsFallbackSocketFactory");
            if (username != null) config.setUsername(username);
            if (password != null) config.setPassword(password);
            config.setMaximumPoolSize(10);
            config.setMinimumIdle(2);
            config.setInitializationFailTimeout(60000);
            config.setPoolName("ExpenseTrack-Postgres-Pool");
            return new HikariDataSource(config);
        } catch (Exception e) {
            String msg = "Failed to configure PostgreSQL from JDBC URL: " + e.getMessage();
            logger.error(msg, e);
            throw new IllegalStateException(msg, e);
        }
    }
}

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
import java.net.URI;

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
        String databaseUrl = env.getProperty("DATABASE_URL");
        String springDatasourceUrl = env.getProperty("spring.datasource.url");
        String springUsername = env.getProperty("spring.datasource.username");
        String springPassword = env.getProperty("spring.datasource.password");

        // Clean surrounding quotes if present
        if (databaseUrl != null) {
            databaseUrl = databaseUrl.trim();
            if (databaseUrl.startsWith("\"") && databaseUrl.endsWith("\"") && databaseUrl.length() > 1) {
                databaseUrl = databaseUrl.substring(1, databaseUrl.length() - 1);
            }
        }

        // 1. If DATABASE_URL is set (from Neon or Render)
        if (databaseUrl != null && (databaseUrl.startsWith("postgres://") || databaseUrl.startsWith("postgresql://"))) {
            logger.info("Configuring PostgreSQL DataSource from DATABASE_URL...");
            try {
                URI uri = new URI(databaseUrl);
                String userInfo = uri.getUserInfo();
                String username = null;
                String password = null;
                if (userInfo != null && userInfo.contains(":")) {
                    String[] parts = userInfo.split(":", 2);
                    username = parts[0];
                    password = parts[1];
                }

                int port = uri.getPort() > 0 ? uri.getPort() : 5432;
                String host = uri.getHost();
                String path = uri.getPath();

                StringBuilder jdbcUrl = new StringBuilder("jdbc:postgresql://")
                        .append(host)
                        .append(":")
                        .append(port)
                        .append(path);

                String query = uri.getQuery();
                if (query != null && !query.isEmpty()) {
                    String[] queryParams = query.split("&");
                    StringBuilder cleanQuery = new StringBuilder();
                    for (String param : queryParams) {
                        if (!param.startsWith("channel_binding=")) {
                            if (cleanQuery.length() > 0) cleanQuery.append("&");
                            cleanQuery.append(param);
                        }
                    }
                    if (cleanQuery.length() > 0) {
                        jdbcUrl.append("?").append(cleanQuery);
                    } else {
                        jdbcUrl.append("?sslmode=require");
                    }
                } else {
                    jdbcUrl.append("?sslmode=require");
                }

                if (!jdbcUrl.toString().contains("socketFactory=")) {
                    jdbcUrl.append("&socketFactory=com.expensetracker.config.DnsFallbackSocketFactory");
                }

                HikariConfig config = new HikariConfig();
                config.setDriverClassName("org.postgresql.Driver");
                config.setJdbcUrl(jdbcUrl.toString());
                config.addDataSourceProperty("socketFactory", "com.expensetracker.config.DnsFallbackSocketFactory");
                if (username != null) config.setUsername(username);
                if (password != null) config.setPassword(password);
                config.setMaximumPoolSize(10);
                config.setMinimumIdle(2);
                config.setIdleTimeout(300000);
                config.setConnectionTimeout(20000);
                config.setMaxLifetime(1200000);

                return new HikariDataSource(config);
            } catch (Exception e) {
                logger.error("Failed to parse DATABASE_URL, falling back to standard configuration", e);
            }
        }

        // 2. If spring.datasource.url is set to PostgreSQL
        if (springDatasourceUrl != null && springDatasourceUrl.startsWith("jdbc:postgresql:")) {
            logger.info("Configuring PostgreSQL DataSource from spring.datasource.url...");
            HikariConfig config = new HikariConfig();
            config.setDriverClassName("org.postgresql.Driver");
            config.setJdbcUrl(springDatasourceUrl);
            config.addDataSourceProperty("socketFactory", "com.expensetracker.config.DnsFallbackSocketFactory");
            if (springUsername != null) config.setUsername(springUsername);
            if (springPassword != null) config.setPassword(springPassword);
            config.setMaximumPoolSize(10);
            return new HikariDataSource(config);
        }

        // 3. Fallback to local H2 file database
        logger.info("Configuring local H2 file DataSource...");
        HikariConfig config = new HikariConfig();
        config.setDriverClassName("org.h2.Driver");
        config.setJdbcUrl(springDatasourceUrl != null ? springDatasourceUrl : "jdbc:h2:file:./data/expensedb;DB_CLOSE_DELAY=-1;DB_CLOSE_ON_EXIT=FALSE");
        config.setUsername(springUsername != null ? springUsername : "sa");
        config.setPassword(springPassword != null ? springPassword : "");
        return new HikariDataSource(config);
    }
}

package com.expensetracker;

import com.expensetracker.config.DatabaseConfig;
import com.zaxxer.hikari.HikariDataSource;
import org.junit.jupiter.api.Test;
import org.springframework.mock.env.MockEnvironment;

import static org.junit.jupiter.api.Assertions.*;

public class DatabaseConfigTest {

    @Test
    void testProdProfileWithoutDatabaseUrlThrowsException() {
        MockEnvironment env = new MockEnvironment();
        env.setActiveProfiles("prod");
        DatabaseConfig config = new DatabaseConfig(env);

        IllegalStateException ex = assertThrows(IllegalStateException.class, config::dataSource);
        assertTrue(ex.getMessage().contains("CRITICAL CONFIGURATION ERROR"));
        assertTrue(ex.getMessage().contains("DATABASE_URL"));
    }

    @Test
    void testLocalProfileWithInMemoryH2() {
        MockEnvironment env = new MockEnvironment();
        env.setProperty("spring.datasource.url", "jdbc:h2:mem:testdb;DB_CLOSE_DELAY=-1");
        DatabaseConfig config = new DatabaseConfig(env);

        assertDoesNotThrow(() -> {
            HikariDataSource ds = (HikariDataSource) config.dataSource();
            assertNotNull(ds);
            assertEquals("org.h2.Driver", ds.getDriverClassName());
            assertTrue(ds.getJdbcUrl().contains("jdbc:h2:mem:testdb"));
            ds.close();
        });
    }

    @Test
    void testProdProfileWithInvalidUrlThrowsException() {
        MockEnvironment env = new MockEnvironment();
        env.setActiveProfiles("prod");
        env.setProperty("DATABASE_URL", "not-a-valid-url");
        DatabaseConfig config = new DatabaseConfig(env);

        assertThrows(IllegalStateException.class, config::dataSource);
    }
}

# Liquibase Docker Image with PostgreSQL and Oracle drivers
FROM liquibase/liquibase:4.25

# PostgreSQL driver is included by default

# Oracle JDBC Driver (ojdbc11)
# Note: Oracle driver needs to be downloaded from Oracle website
# or use the thin driver included in some distributions
USER root
RUN apt-get update && apt-get install -y wget && \
    wget -q https://repo1.maven.org/maven2/com/oracle/database/jdbc/ojdbc11/23.3.0.23.09/ojdbc11-23.3.0.23.09.jar \
    -O /liquibase/lib/ojdbc11.jar && \
    apt-get remove -y wget && apt-get autoremove -y && rm -rf /var/lib/apt/lists/*

USER liquibase

# Set working directory
WORKDIR /liquibase/changelog

# Copy changelog files
COPY --chown=liquibase:liquibase changelog/ /liquibase/changelog/
COPY --chown=liquibase:liquibase seed/ /liquibase/seed/
COPY --chown=liquibase:liquibase *.properties /liquibase/

# Default command
CMD ["--help"]

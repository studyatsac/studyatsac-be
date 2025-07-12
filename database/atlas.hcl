data "external_schema" "sequelize" {
    program = [
        "npx",
        "@ariga/atlas-provider-sequelize",
        "load",
        "--path", "./src/models/mysql",
        "--dialect", "mysql", // mariadb | postgres | sqlite | mssql
    ]
}

env "sequelize" {
    src = data.external_schema.sequelize.url
    url = "mysql://${getenv("MYSQL_ROOT_USER")}:${getenv("MYSQL_ROOT_PASSWORD")}@${getenv("MYSQL_HOST")}/${getenv("MYSQL_DATABASE")}"
    dev = "docker+mysql://_/mysql:8.0.42/dev"
    migration {
        dir = "file://database/migrations"
    }
    format {
        migrate {
            diff = "{{ sql . \"  \" }}"
        }
    }
}

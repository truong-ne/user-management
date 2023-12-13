import { postgresOption } from "src/config/database.config";
import { MedicalRecord } from "src/user/entities/medical-record.entity";
import { User } from "src/user/entities/user.entity";
import { DataSource, DataSourceOptions } from "typeorm";

export const dataSourceOptions: DataSourceOptions = {
    ...postgresOption,
    autoLoadEntities: true,
    entities: [MedicalRecord, User],
    migrations: ['dist/db/migrations/*.js']
}

const dataSource = new DataSource(dataSourceOptions)
export default dataSource
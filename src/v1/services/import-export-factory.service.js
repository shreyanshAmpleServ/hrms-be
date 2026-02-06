const {
  DepartmentImportExportService,
} = require("./departmentImportExportService");
const {
  DesignationImportExportService,
} = require("./designationImportExportService");
const { CountryImportExportService } = require("./countryImportExportService");

class ImportExportFactory {
  static services = new Map([
    ["departments", DepartmentImportExportService],
    ["designations", DesignationImportExportService],
    ["countries", CountryImportExportService],
  ]);

  static getService(tableName) {
    const ServiceClass = this.services.get(tableName);
    return ServiceClass ? new ServiceClass() : null;
  }

  static getSupportedTables() {
    return Array.from(this.services.keys());
  }

  static registerService(tableName, service) {
    this.services.set(tableName, service);
  }

  static isTableSupported(tableName) {
    return this.services.has(tableName);
  }

  static getAllServices() {
    return this.services;
  }

  static unregisterService(tableName) {
    return this.services.delete(tableName);
  }

  static clearServices() {
    this.services.clear();
  }

  static getServiceMetadata(tableName) {
    const service = this.getService(tableName);
    if (!service) return null;

    return {
      displayName: service.displayName,
      columns: service.columns.length,
      searchFields: service.searchFields,
    };
  }
}

module.exports = { ImportExportFactory };

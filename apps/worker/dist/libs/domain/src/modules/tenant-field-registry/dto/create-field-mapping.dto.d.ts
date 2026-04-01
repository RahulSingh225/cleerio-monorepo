export declare class CreateFieldMappingDto {
    fieldKey: string;
    fieldIndex: number;
    headerName: string;
    displayLabel: string;
    dataType?: 'string' | 'number' | 'date' | 'boolean';
    isPii?: boolean;
}

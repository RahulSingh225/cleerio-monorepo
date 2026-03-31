import { Injectable } from '@nestjs/common';

@Injectable()
export class TemplateRendererService {
  /**
   * Replaces variables mapped as {{fieldN}} with the corresponding JSONB record dynamic_fields.
   */
  renderBody(templateBody: string, dynamicFields: Record<string, any>): string {
    let rendered = templateBody;
    
    // Replace standard fields using regex lookup
    rendered = rendered.replace(/\{\{([^}]+)\}\}/g, (match, fieldName) => {
      const value = dynamicFields[fieldName.trim()];
      return value !== undefined && value !== null ? String(value) : match; // preserve if missing
    });

    return rendered;
  }
}

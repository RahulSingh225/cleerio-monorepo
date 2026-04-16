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

  /**
   * Recursively resolves variables in a JSON object or array.
   */
  renderObject(obj: any, variables: Record<string, any>): any {
    if (typeof obj === 'string') {
      return this.renderBody(obj, variables);
    }
    
    if (Array.isArray(obj)) {
      return obj.map(item => this.renderObject(item, variables));
    }
    
    if (obj !== null && typeof obj === 'object') {
      const result: Record<string, any> = {};
      for (const key in obj) {
        result[key] = this.renderObject(obj[key], variables);
      }
      return result;
    }
    
    return obj;
  }
}

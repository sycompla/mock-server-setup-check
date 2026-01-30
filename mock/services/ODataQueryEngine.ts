/**
 * OData Query Engine
 *
 * Parses and executes OData query options on in-memory data:
 * - $filter (eq, ne, gt, lt, ge, le, and, or, contains, startswith, endswith)
 * - $orderby (asc, desc)
 * - $top (limit)
 * - $skip (offset)
 * - $count (return total count)
 * - $select (field projection)
 *
 * @namespace ntt.wms.mock.services
 */

interface QueryOptions {
    $filter?: string;
    $orderby?: string;
    $top?: string;
    $skip?: string;
    $count?: string;
    $select?: string;
}

export default class ODataQueryEngine {

    /**
     * Apply all query options to a dataset
     */
    applyQuery(data: any[], queryOptions: QueryOptions): { value: any[], count?: number } {
        let result = [...data];

        // 1. Apply $filter
        if (queryOptions.$filter) {
            result = this.applyFilter(result, queryOptions.$filter);
        }

        // Store count before pagination (for $count=true)
        const totalCount = result.length;

        // 2. Apply $orderby
        if (queryOptions.$orderby) {
            result = this.applyOrderBy(result, queryOptions.$orderby);
        }

        // 3. Apply $skip
        if (queryOptions.$skip) {
            const skip = parseInt(queryOptions.$skip, 10);
            result = result.slice(skip);
        }

        // 4. Apply $top
        if (queryOptions.$top) {
            const top = parseInt(queryOptions.$top, 10);
            result = result.slice(0, top);
        }

        // 5. Apply $select
        if (queryOptions.$select) {
            result = this.applySelect(result, queryOptions.$select);
        }

        // 6. Handle $count
        const response: any = { value: result };
        if (queryOptions.$count === 'true') {
            response['@odata.count'] = totalCount;
        }

        return response;
    }

    /**
     * Apply $filter query option
     * Supports: eq, ne, gt, lt, ge, le, and, or, contains, startswith, endswith
     */
    private applyFilter(data: any[], filterStr: string): any[] {
        try {
            const predicate = this.parseFilter(filterStr);
            return data.filter(predicate);
        } catch (error) {
            console.warn('[ODataQueryEngine] Filter parse error:', error);
            return data;
        }
    }

    /**
     * Parse filter string into a predicate function
     */
    private parseFilter(filterStr: string): (item: any) => boolean {
        // Simple filter parser - supports basic operations
        // For production, consider using a proper OData parser library

        // Handle 'and' operator
        if (filterStr.includes(' and ')) {
            const parts = filterStr.split(' and ');
            const predicates = parts.map(part => this.parseFilter(part.trim()));
            return (item: any) => predicates.every(p => p(item));
        }

        // Handle 'or' operator
        if (filterStr.includes(' or ')) {
            const parts = filterStr.split(' or ');
            const predicates = parts.map(part => this.parseFilter(part.trim()));
            return (item: any) => predicates.some(p => p(item));
        }

        // Handle comparison operators
        const eqMatch = filterStr.match(/(\w+)\s+eq\s+'?([^']+)'?/);
        if (eqMatch) {
            const [, field, value] = eqMatch;
            return (item: any) => item[field] == value.replace(/'/g, '');
        }

        const neMatch = filterStr.match(/(\w+)\s+ne\s+'?([^']+)'?/);
        if (neMatch) {
            const [, field, value] = neMatch;
            return (item: any) => item[field] != value.replace(/'/g, '');
        }

        const gtMatch = filterStr.match(/(\w+)\s+gt\s+(\d+)/);
        if (gtMatch) {
            const [, field, value] = gtMatch;
            return (item: any) => parseFloat(item[field]) > parseFloat(value);
        }

        const ltMatch = filterStr.match(/(\w+)\s+lt\s+(\d+)/);
        if (ltMatch) {
            const [, field, value] = ltMatch;
            return (item: any) => parseFloat(item[field]) < parseFloat(value);
        }

        const geMatch = filterStr.match(/(\w+)\s+ge\s+(\d+)/);
        if (geMatch) {
            const [, field, value] = geMatch;
            return (item: any) => parseFloat(item[field]) >= parseFloat(value);
        }

        const leMatch = filterStr.match(/(\w+)\s+le\s+(\d+)/);
        if (leMatch) {
            const [, field, value] = leMatch;
            return (item: any) => parseFloat(item[field]) <= parseFloat(value);
        }

        // Handle string functions
        const containsMatch = filterStr.match(/contains\((\w+),\s*'([^']+)'\)/);
        if (containsMatch) {
            const [, field, value] = containsMatch;
            return (item: any) => {
                const fieldValue = item[field];
                return fieldValue && fieldValue.toString().toLowerCase().includes(value.toLowerCase());
            };
        }

        const startswithMatch = filterStr.match(/startswith\((\w+),\s*'([^']+)'\)/);
        if (startswithMatch) {
            const [, field, value] = startswithMatch;
            return (item: any) => {
                const fieldValue = item[field];
                return fieldValue && fieldValue.toString().toLowerCase().startsWith(value.toLowerCase());
            };
        }

        const endswithMatch = filterStr.match(/endswith\((\w+),\s*'([^']+)'\)/);
        if (endswithMatch) {
            const [, field, value] = endswithMatch;
            return (item: any) => {
                const fieldValue = item[field];
                return fieldValue && fieldValue.toString().toLowerCase().endsWith(value.toLowerCase());
            };
        }

        // Default: no filter
        console.warn('[ODataQueryEngine] Unsupported filter expression:', filterStr);
        return () => true;
    }

    /**
     * Apply $orderby query option
     * Format: "field1 asc, field2 desc"
     */
    private applyOrderBy(data: any[], orderByStr: string): any[] {
        const orderClauses = orderByStr.split(',').map(s => s.trim());

        return data.sort((a, b) => {
            for (const clause of orderClauses) {
                const parts = clause.split(' ');
                const field = parts[0];
                const direction = parts[1] || 'asc';

                const aVal = a[field];
                const bVal = b[field];

                if (aVal === bVal) continue;

                let comparison = 0;
                if (aVal < bVal) comparison = -1;
                if (aVal > bVal) comparison = 1;

                return direction === 'desc' ? -comparison : comparison;
            }
            return 0;
        });
    }

    /**
     * Apply $select query option
     * Format: "field1,field2,field3"
     */
    private applySelect(data: any[], selectStr: string): any[] {
        const fields = selectStr.split(',').map(f => f.trim());

        return data.map(item => {
            const selected: any = {};
            fields.forEach(field => {
                if (item.hasOwnProperty(field)) {
                    selected[field] = item[field];
                }
            });
            return selected;
        });
    }

    /**
     * Parse query string into QueryOptions object
     */
    parseQueryString(queryString: string): QueryOptions {
        const params = new URLSearchParams(queryString);
        const options: QueryOptions = {};

        if (params.has('$filter')) options.$filter = params.get('$filter')!;
        if (params.has('$orderby')) options.$orderby = params.get('$orderby')!;
        if (params.has('$top')) options.$top = params.get('$top')!;
        if (params.has('$skip')) options.$skip = params.get('$skip')!;
        if (params.has('$count')) options.$count = params.get('$count')!;
        if (params.has('$select')) options.$select = params.get('$select')!;

        return options;
    }

    /**
     * Extract query string from URL
     */
    extractQueryString(url: string): string {
        const queryIndex = url.indexOf('?');
        return queryIndex >= 0 ? url.substring(queryIndex + 1) : '';
    }
}

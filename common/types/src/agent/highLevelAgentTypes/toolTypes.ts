
import {ZodType} from 'zod'

export interface ToolConfig{
    id:string;
    description:string;
    inputSchema: ZodType<any, any, any>;
    outputSchema?: ZodType<any, any, any>;
    execute: (context:any) => any;
}


export interface ToolInterface{

    execute: (input:any,context: any) => Promise<{ success: boolean; result?: any; error?: string }>;

    getToolDescription:()=> string

    getToolSchema:()=>ZodType<any, any, any>;
   

}
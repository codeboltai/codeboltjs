import type { ASTNode } from "../types/commonTypes";
/**
 * A collection of code parser functions.
 */
declare const cbcodeparsers: {
    /**
     * Retrieves the classes in a given file.
     * @param file The file to parse for classes.
     */
    getClassesInFile: (file: string) => Promise<{
        error: string;
    } | {
        name: any;
        location: string;
    }[]>;
    /**
     * Retrieves the functions in a given class within a file.
     * @param file The file containing the class.
     * @param className The name of the class to parse for functions.
     */
    getFunctionsinClass: (file: string, className: string) => Promise<{
        error: string;
    } | {
        name: string;
        class: string;
        location: string;
    }[]>;
    /**
     * Generates an Abstract Syntax Tree (AST) for a given file.
     * @param file The file to generate an AST for.
     * @param className The name of the class to focus the AST generation on.
     */
    getAstTreeInFile: (file: string, className?: string) => Promise<ASTNode | {
        error: string;
    }>;
};
export default cbcodeparsers;

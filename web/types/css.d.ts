// Allow importing plain CSS/SCSS files in TypeScript for Next.js
declare module '*.css';
declare module '*.scss';
declare module '*.sass';

// For CSS Modules (if used)
declare module '*.module.css' {
    const classes: { [key: string]: string };
    export default classes;
}
declare module '*.module.scss' {
    const classes: { [key: string]: string };
    export default classes;
}
declare module '*.module.sass' {
    const classes: { [key: string]: string };
    export default classes;
}
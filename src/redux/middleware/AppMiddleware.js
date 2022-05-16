export const AppMiddleware = store => next => action => {
    next(action);
}
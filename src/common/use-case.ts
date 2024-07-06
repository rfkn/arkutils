export interface UseCaseSuccessResult<T = unknown> {
    success: true;
    data?: T extends undefined ? never : T;
}

export interface UseCaseErrorResult {
    success: false;
    data?: any;
    error?: string;
}

export type UseCaseResult<T = unknown> =
    | UseCaseSuccessResult<T>
    | UseCaseErrorResult;

export interface UseCase<T = unknown, U = unknown> {
    execute(payload: T): Promise<UseCaseResult<U>>;
}

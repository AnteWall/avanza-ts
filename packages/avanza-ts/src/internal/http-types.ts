export type AccessMode = 'anonymous' | 'optional' | 'public' | 'required';

export type HttpMethod = 'DELETE' | 'GET' | 'PATCH' | 'POST' | 'PUT';

export type QueryPrimitive = boolean | number | string;

export type QueryValue = QueryPrimitive | readonly QueryPrimitive[] | null | undefined;

export interface HttpRequest {
  readonly access: AccessMode;
  readonly body?: unknown;
  readonly headers?: HeadersInit;
  readonly method: HttpMethod;
  readonly path: string;
  readonly query?: Readonly<Record<string, QueryValue>>;
  readonly redirect?: RequestRedirect;
  readonly signal?: AbortSignal;
}

export interface HttpResponse<Response> {
  readonly body: Response;
  readonly headers: Headers;
  readonly status: number;
  readonly statusText: string;
}

export interface HttpTransport {
  request<Response>(request: HttpRequest): Promise<Response>;
}

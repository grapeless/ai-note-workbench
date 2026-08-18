export const BASE_URL = (
    import.meta.env.VITE_API_BASE_URL || '/api'
).replace(/\/+$/, '') // 去掉最后的斜杠

export interface Result<T> {
    code: number
    data: T
    message: string
}

/**
 * 封装 Fetch 的错误处理和数据返回
 *
 * @param path 目标路径，不需要添加 baseURL
 * @param options Fetch 请求配置
 */
async function request<T = unknown>(
    path: string,
    options: RequestInit = {}
): Promise<T> {
    const response = await fetch(`${BASE_URL}${path}`, options)

    // HTTP 状态码不在 200～299 范围内时，
    // response.ok 为 false，但 Promise 仍然是 fulfilled。
    //
    // 后端没有统一响应结构时，可以使用下面的处理：
    /*
    if (!response.ok) {
        const message = await response.text()
        throw new Error(message || `HTTP ${response.status}`)
    }
    */

    // 成功但没有响应体
    if (response.status === 204) {
        throw new Error('空响应体')
    }

    // 解析后端统一响应
    const result: Result<T> = await response.json()

    // HTTP 错误或业务错误
    if (!response.ok || result.code !== 0) {
        throw new Error(`${result.code}:${result.message}`)
    }

    return result.data
}

type RequestParams = Record<string, string | number | boolean | null | undefined>
type JsonRequestOptions = Omit<RequestInit, 'method' | 'body'>

function appendSearchParams(path: string, params: RequestParams): string {
    const searchParams = new URLSearchParams()

    Object.entries(params).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
            searchParams.set(key, String(value))
        }
    })

    const query = searchParams.toString()

    return query ? `${path}${path.includes('?') ? '&' : '?'}${query}` : path
}

/**
 * GET 请求
 */
export function get<T = unknown>(
    path: string,
    params: RequestParams = {},
    options: Omit<RequestInit, 'method' | 'body'> = {}
): Promise<T> {
    const requestPath = appendSearchParams(path, params)

    return request<T>(requestPath, {
        ...options,
        method: 'GET'
    })
}

/**
 * POST 请求
 */
export function post<T = unknown>(
    path: string,
    data?: unknown,
    options: JsonRequestOptions = {}
): Promise<T> {
    return jsonRequest<T>('POST', path, data, options)
}

/**
 * PUT 请求
 */
export function put<T = unknown>(
    path: string,
    data?: unknown,
    options: JsonRequestOptions = {}
): Promise<T> {
    return jsonRequest<T>('PUT', path, data, options)
}

/**
 * DELETE 请求
 */
export function remove<T = unknown>(
    path: string,
    params: RequestParams = {},
    options: Omit<RequestInit, 'method' | 'body'> = {}
): Promise<T> {
    return request<T>(appendSearchParams(path, params), {
        ...options,
        method: 'DELETE'
    })
}

/**
 * 发送 JSON 请求
 */
function jsonRequest<T = unknown>(
    method: 'POST' | 'PUT',
    path: string,
    data?: unknown,  //更安全的any，不能直接操作该类型的值
    options: JsonRequestOptions = {}
): Promise<T> {
    const headers = new Headers(options.headers)

    // 有请求数据且调用者未指定类型时，默认按 JSON 发送
    if (data !== undefined && !headers.has('Content-Type')) {
        headers.set('Content-Type', 'application/json')
    }

    return request<T>(path, {
        ...options,
        method,
        headers,
        body: data === undefined ? undefined : JSON.stringify(data)
    })
}

/**
 * 文件上传
 */
export function upload<T = unknown>(
    path: string,
    formData: FormData,
    options: Omit<RequestInit, 'method' | 'body'> = {}
): Promise<T> {
    return request<T>(path, {
        ...options,
        method: 'POST',
        body: formData
    })
}

/**
 * 发送 POST 请求并逐条读取服务端 SSE 数据
 */
export async function postStream<T>(
    path: string,
    data: unknown,
    onMessage: (message: T) => void,
    options: Omit<RequestInit, 'method' | 'body'> = {}
): Promise<void> {
    const headers = new Headers(options.headers)

    headers.set('Content-Type', 'application/json')
    headers.set('Accept', 'text/event-stream')

    const response = await fetch(`${BASE_URL}${path}`, {
        ...options,
        method: 'POST',
        headers,
        body: JSON.stringify(data)
    })

    if (!response.ok) {
        const result: Result<unknown> = await response.json()
        throw new Error(`${result.code}:${result.message}`)
    }

    const reader = response.body!.getReader()
    const decoder = new TextDecoder()
    let buffer = ''

    while (true) {
        const {value, done} = await reader.read()

        if (done) break

        buffer += decoder.decode(value, {stream: true})

        const frames = buffer.split(/\r?\n\r?\n/)
        buffer = frames.pop() ?? ''

        frames.forEach(frame => {
            onMessage(JSON.parse(
                frame.split(/\r?\n/)
                    .filter(line => line.startsWith('data:'))
                    .map(line => line.slice(5).trimStart())
                    .join('\n')
            ) as T)
        })
    }
}

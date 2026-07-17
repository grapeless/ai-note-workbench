export const BASE_URL = (
    import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080'
).replace(/\/+$/, '') // 去掉最后的斜杠

export interface Result<T> {
    code: number
    data: T | null
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
): Promise<T | null> {
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
        return null
    }

    // 解析后端统一响应
    const result: Result<T> = await response.json()

    // HTTP 错误或业务错误
    if (!response.ok || result.code !== 0) {
        throw new Error(`${result.code}:${result.message}`)
    }

    return result.data
}

/**
 * GET 请求
 */
export function get<T = unknown>(
    path: string,
    params: Record<string, string | number | boolean | null | undefined> = {},
    options: Omit<RequestInit, 'method' | 'body'> = {}
): Promise<T | null> {
    const searchParams = new URLSearchParams()

    Object.entries(params).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
            searchParams.set(key, String(value))
        }
    })

    const query = searchParams.toString()

    // 判断原路径中是否已经存在查询参数：已经有?，说明后面追加参数时要用& ：没有?，说明这是第一个查询参数，要用?
    const separator = path.includes('?') ? '&' : '?'
    // 如果 query 有内容，就把查询参数拼接到 path 后面；如果 query 为空，就直接使用原来的 path
    const requestPath = query ? `${path}${separator}${query}` : path

    return request<T>(requestPath, {
        ...options,
        method: 'GET'
    })
}

type JsonRequestOptions = Omit<RequestInit, 'method' | 'body'>

/**
 * POST 请求
 */
export function post<T = unknown>(
    path: string,
    data?: unknown,
    options: JsonRequestOptions = {}
): Promise<T | null> {
    return jsonRequest<T>('POST', path, data, options)
}

/**
 * PUT 请求
 */
export function put<T = unknown>(
    path: string,
    data?: unknown,
    options: JsonRequestOptions = {}
): Promise<T | null> {
    return jsonRequest<T>('PUT', path, data, options)
}

/**
 * DELETE 请求
 */
export function remove<T = unknown>(
    path: string,
    data?: unknown,
    options: JsonRequestOptions = {}
): Promise<T | null> {
    return jsonRequest<T>('DELETE', path, data, options)
}

/**
 * 发送 JSON 请求
 */
function jsonRequest<T = unknown>(
    method: 'POST' | 'PUT' | 'DELETE',
    path: string,
    data?: unknown,  //更安全的any，不能直接操作该类型的值
    options: JsonRequestOptions = {}
): Promise<T | null> {
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
): Promise<T | null> {
    return request<T>(path, {
        ...options,
        method: 'POST',
        body: formData
    })
}
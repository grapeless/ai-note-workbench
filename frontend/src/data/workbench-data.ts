export type NoteSummary = {
  id: number
  title: string
  collection: string
  date: string
  excerpt: string
  open?: boolean
}

export const notes: NoteSummary[] = [
  {
    id: 1,
    title: "RAG 检索链路备忘",
    collection: "技术研究",
    date: "昨天",
    excerpt: "embedding、top-k、rerank，以及回答时必须展示引用。",
    open: true,
  },
  {
    id: 2,
    title: "Spring Boot API 草图",
    collection: "技术研究",
    date: "7月12日",
    excerpt: "/api/documents、/api/search、/api/chat 三组接口。",
  },
  {
    id: 3,
    title: "pgvector 索引实验",
    collection: "技术研究",
    date: "7月9日",
    excerpt: "HNSW 参数和召回率之间的简单对比。",
  },
  {
    id: 4,
    title: "向量检索召回率记录",
    collection: "技术研究",
    date: "7月5日",
    excerpt: "不同 top-k 与 rerank 策略下的召回率记录。",
  },
]

export const sources = [
  { id: 1, title: "当前笔记", detail: "MVP 核心路线" },
  { id: 2, title: "RAG 检索链路备忘", detail: "引用与 rerank" },
  { id: 3, title: "Spring Boot API 草图", detail: "接口设计参考" },
]

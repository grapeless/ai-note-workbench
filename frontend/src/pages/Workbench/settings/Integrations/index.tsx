import {type FormEvent, useId, useState} from "react"
import {Brain, Check, ChevronRight, CircleCheck, KeyRound, Plus, RefreshCw, Save,} from "lucide-react"

import {Badge} from "@/components/ui/badge"
import {Button} from "@/components/ui/button"
import {Card, CardAction, CardContent, CardDescription, CardFooter, CardHeader, CardTitle,} from "@/components/ui/card"
import {Collapsible, CollapsibleContent, CollapsibleTrigger} from "@/components/ui/collapsible"
import {Field, FieldDescription, FieldGroup, FieldLabel} from "@/components/ui/field"
import {Input} from "@/components/ui/input"
import {Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue,} from "@/components/ui/select"
import {Separator} from "@/components/ui/separator"
import {Switch} from "@/components/ui/switch"
import {cn} from "@/lib/utils"

const providerItems = [
    {label: "OpenAI", value: "openai"},
    {label: "DeepSeek", value: "deepseek"},
    {label: "OpenAI 兼容服务", value: "openai-compatible"},
]

export function Integrations() {
    return (
        <div className="panel-scroll h-full min-h-0 overflow-y-auto bg-paper">
            <main className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-5 py-7 sm:px-8 lg:px-10 lg:py-9">
                <PageHeader/>

                <section className="flex flex-col gap-5" aria-labelledby="providers-heading">
                    <div
                        className="flex flex-col gap-3 border-b border-ink/25 pb-5 sm:flex-row sm:items-end sm:justify-between">
                        <div className="flex flex-col gap-1">
                            <p className="section-index text-workbench-primary">SETTINGS / AI PROVIDERS</p>
                            <h2 id="providers-heading" className="font-display text-2xl font-black tracking-tight">
                                模型服务商
                            </h2>
                            <p className="max-w-2xl text-sm leading-6 text-muted-foreground">
                                配置工作台调用的模型服务。API Key 将在服务端加密保存，保存后不再返回完整内容。
                            </p>
                        </div>

                        <Badge variant="outline" className="self-start rounded-none">
                            1 个已连接
                        </Badge>
                    </div>

                    <ProviderForm/>
                    <ConnectedProviderCard/>
                </section>
            </main>
        </div>
    )
}

function PageHeader() {
    return (
        <header className="flex flex-col gap-5 border-b-2 border-ink pb-6 sm:flex-row sm:items-end sm:justify-between">
            <div className="flex flex-col gap-3">
                <div className="flex items-center gap-3">
                    <Brain className="size-6" aria-hidden={true} strokeWidth={2}/>
                    <div>
                        <h1 className="font-display text-3xl font-black tracking-tight sm:text-4xl">
                            Integrations
                        </h1>
                    </div>
                </div>
                <p className="max-w-2xl text-sm leading-6 text-muted-foreground">
                    连接并管理 AI 模型服务，为文档解析、知识检索和 ASK / AI 提供能力。
                </p>
            </div>

            <Badge variant="secondary" className="h-8 self-start rounded-none px-3 sm:self-end">
                <CircleCheck data-icon="inline-start" aria-hidden="true"/>
                Agent ready
            </Badge>
        </header>
    )
}

function ProviderForm() {
    const providerId = useId()
    const apiKeyId = useId()
    const labelId = useId()
    const modelId = useId()
    const baseUrlId = useId()
    const enabledId = useId()
    const [apiKey, setApiKey] = useState("")
    const [advancedOpen, setAdvancedOpen] = useState(false)
    const [feedback, setFeedback] = useState("填写凭据后即可保存并测试连接。")

    const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault()
        setFeedback("配置已记录；后端接口接入后将执行加密保存与连接测试。")
    }

    return (
        <Card
            role="region"
            aria-labelledby="add-provider-title"
            className="gap-0 rounded-none py-0 ring-1 ring-ink/35 shadow-[4px_4px_0_var(--workbench-primary-soft)]"
        >
            <CardHeader className="rounded-none border-b border-ink/20 bg-paper-warm/70 px-5 py-4 sm:px-6">
                <div className="flex items-center gap-3">
                    <span
                        className="grid size-9 place-items-center border border-ink bg-paper"
                        aria-hidden="true"
                    >
                        <Plus className="size-4"/>
                    </span>
                    <div>
                        <CardTitle id="add-provider-title" className="font-black">
                            添加服务商
                        </CardTitle>
                        <CardDescription className="mt-0.5">
                            选择服务商并输入连接凭据。
                        </CardDescription>
                    </div>
                </div>
                <CardAction>
                    <Badge variant="outline" className="rounded-none">NEW</Badge>
                </CardAction>
            </CardHeader>

            <form onSubmit={handleSubmit}>
                <CardContent className="px-5 py-6 sm:px-6">
                    <FieldGroup>
                        <Field>
                            <FieldLabel htmlFor={providerId}>服务商</FieldLabel>
                            <Select defaultValue="openai" items={providerItems}>
                                <SelectTrigger id={providerId} className="h-10 w-full sm:max-w-xs">
                                    <SelectValue/>
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectGroup>
                                        {providerItems.map((item) => (
                                            <SelectItem key={item.value} value={item.value}>
                                                {item.label}
                                            </SelectItem>
                                        ))}
                                    </SelectGroup>
                                </SelectContent>
                            </Select>
                        </Field>

                        <Field>
                            <FieldLabel htmlFor={apiKeyId}>API Key</FieldLabel>
                            <Input
                                id={apiKeyId}
                                value={apiKey}
                                onChange={(event) => {
                                    setApiKey(event.target.value)
                                    setFeedback("填写凭据后即可保存并测试连接。")
                                }}
                                type="password"
                                required
                                autoComplete="off"
                                placeholder="sk-••••••••••••••••"
                                className="h-10"
                            />
                            <FieldDescription>
                                凭据仅用于服务端连接验证，不会在保存后再次显示明文。
                            </FieldDescription>
                        </Field>

                        <Collapsible open={advancedOpen} onOpenChange={setAdvancedOpen}>
                            <div className="border border-ink/25 bg-paper-warm/35">
                                <CollapsibleTrigger
                                    className="flex min-h-11 w-full cursor-pointer items-center gap-2 px-4 text-left text-sm font-semibold focus-visible:outline-3 focus-visible:outline-marker-blue">
                                    <ChevronRight
                                        className={cn(
                                            "size-4 transition-transform motion-reduce:transition-none",
                                            advancedOpen && "rotate-90",
                                        )}
                                        aria-hidden="true"
                                    />
                                    高级设置
                                    <span className="ml-auto text-xs font-normal text-muted-foreground">
                                        可选
                                    </span>
                                </CollapsibleTrigger>

                                <CollapsibleContent>
                                    <Separator/>
                                    <FieldGroup className="grid gap-4 p-4 sm:grid-cols-2">
                                        <Field>
                                            <FieldLabel htmlFor={labelId}>显示名称</FieldLabel>
                                            <Input id={labelId} placeholder="例如：团队 OpenAI"
                                                   className="h-10 bg-paper"/>
                                        </Field>

                                        <Field>
                                            <FieldLabel htmlFor={modelId}>默认模型</FieldLabel>
                                            <Input id={modelId} placeholder="例如：gpt-4.1" className="h-10 bg-paper"/>
                                        </Field>

                                        <Field className="sm:col-span-2">
                                            <FieldLabel htmlFor={baseUrlId}>Base URL</FieldLabel>
                                            <Input
                                                id={baseUrlId}
                                                type="url"
                                                placeholder="https://api.example.com/v1"
                                                className="h-10 bg-paper"
                                            />
                                            <FieldDescription>
                                                仅 OpenAI 兼容服务或代理网关需要填写。
                                            </FieldDescription>
                                        </Field>

                                        <Field orientation="horizontal" className="sm:col-span-2">
                                            <div>
                                                <FieldLabel htmlFor={enabledId} className="cursor-pointer">
                                                    保存后启用
                                                </FieldLabel>
                                                <FieldDescription>
                                                    连接测试通过后将该服务商设为可用。
                                                </FieldDescription>
                                            </div>
                                            <Switch id={enabledId} defaultChecked aria-label="保存后启用服务商"/>
                                        </Field>
                                    </FieldGroup>
                                </CollapsibleContent>
                            </div>
                        </Collapsible>
                    </FieldGroup>
                </CardContent>

                <CardFooter
                    className="flex-col items-stretch gap-3 rounded-none border-t border-ink/20 bg-paper-warm/55 sm:flex-row sm:items-center">
                    <p
                        className="min-h-5 text-xs leading-5 text-muted-foreground sm:mr-auto"
                        role="status"
                        aria-live="polite"
                    >
                        {feedback}
                    </p>
                    <Button type="submit" disabled={!apiKey.trim()} size="lg">
                        <Save data-icon="inline-start" aria-hidden="true"/>
                        保存并测试
                    </Button>
                </CardFooter>
            </form>
        </Card>
    )
}

function ConnectedProviderCard() {
    const enabledId = useId()
    const [testResult, setTestResult] = useState("上次测试：今天 14:32")
    const connected = testResult.startsWith("连接正常")

    return (
        <Card
            role="region"
            aria-labelledby="connected-provider-title"
            className="gap-0 rounded-none py-0 ring-1 ring-ink/30"
        >
            <CardHeader className="rounded-none border-b border-ink/20 px-5 py-4 sm:px-6">
                <div className="flex min-w-0 items-start gap-3">
                    <span
                        className="grid size-9 shrink-0 place-items-center border border-ink bg-workbench-primary-soft"
                        aria-hidden="true"
                    >
                        <KeyRound className="size-4 text-workbench-primary"/>
                    </span>
                    <div className="min-w-0">
                        <CardTitle id="connected-provider-title"
                                   className="flex flex-wrap items-center gap-2 font-black">
                            DeepSeek
                            <Badge variant="secondary" className="rounded-none">
                                <Check data-icon="inline-start" aria-hidden="true"/>
                                Connected
                            </Badge>
                            <Badge variant="outline" className="rounded-none">Enabled</Badge>
                        </CardTitle>
                        <CardDescription className="mt-1">
                            当前 ASK / AI 使用的模型服务
                        </CardDescription>
                    </div>
                </div>
            </CardHeader>

            <CardContent className="grid gap-5 px-5 py-5 sm:grid-cols-3 sm:px-6">
                <ProviderMeta label="MODEL" value="deepseek-chat"/>
                <ProviderMeta label="BASE URL" value="https://api.deepseek.com"/>
                <ProviderMeta label="API KEY" value="sk-4••••••e061"/>
            </CardContent>

            <CardFooter
                className="flex-col items-stretch gap-4 rounded-none border-t border-ink/20 sm:flex-row sm:items-center">
                <Field orientation="horizontal" className="sm:mr-auto sm:w-auto">
                    <Switch id={enabledId} defaultChecked/>
                    <FieldLabel htmlFor={enabledId} className="cursor-pointer">
                        用于 ASK / AI
                    </FieldLabel>
                </Field>

                <p className="text-xs text-muted-foreground" role="status" aria-live="polite">
                    {testResult}
                </p>

                <Button
                    type="button"
                    variant="outline"
                    size="lg"
                    onClick={() => setTestResult("连接正常 · 刚刚")}
                >
                    {connected
                        ? <CircleCheck data-icon="inline-start" aria-hidden="true"/>
                        : <RefreshCw data-icon="inline-start" aria-hidden="true"/>}
                    测试连接
                </Button>
            </CardFooter>
        </Card>
    )
}

function ProviderMeta({label, value}: { label: string; value: string }) {
    return (
        <dl className="min-w-0">
            <dt className="text-[10px] font-black tracking-[0.08em] text-muted-foreground">{label}</dt>
            <dd className="mt-1 truncate font-mono text-xs font-semibold" title={value}>{value}</dd>
        </dl>
    )
}

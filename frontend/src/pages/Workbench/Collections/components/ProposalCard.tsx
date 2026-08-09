import {Check, FilePenLine, LoaderCircle} from "lucide-react"

import type {Proposal} from "@/api/workbench/types"
import {Button} from "@/components/ui/button"
import {cn} from "@/lib/utils"

import {DOCUMENT_TYPE_LABEL} from "../types.ts"

interface ProposalCardProps {
    proposal: Proposal
    applying: boolean
    disabled: boolean
    onApply: () => void
}

export function ProposalCard({proposal, applying, disabled, onApply}: ProposalCardProps) {
    const applied = proposal.status === "APPLIED"

    return (
        <section className="rotate-[-0.25deg] border-2 border-ink bg-marker-yellow/10 shadow-[3px_3px_0_var(--kraft)]">
            <div className="flex items-start gap-3 border-b border-dashed border-ink/35 px-3 py-3">
                <span className="grid size-8 shrink-0 place-items-center border-2 border-ink bg-paper">
                    <FilePenLine className="size-4"/>
                </span>
                <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                        <span className="text-[10px] font-black tracking-wide">DOCUMENT CHANGE /</span>
                        <span className={cn(
                            "raw-sticker px-1.5 py-0.5 text-[9px] font-black",
                            applied ? "bg-marker-green/25" : "bg-marker-yellow/70",
                        )}>
                            {proposal.status}
                        </span>
                    </div>
                    <p className="mt-1 wrap-break-word text-sm font-black">{proposal.title}</p>
                    <p className="mt-0.5 font-mono text-[10px] text-ink/55">
                        {proposal.operation} · {DOCUMENT_TYPE_LABEL[proposal.documentType]}
                    </p>
                </div>
            </div>

            <div className="max-h-64 overflow-auto bg-paper/75 py-2 font-mono text-[11px] leading-5">
                {proposal.diff.split("\n").map((line, index) => (
                    <div
                        key={`${index}-${line}`}
                        className={cn(
                            "min-h-5 whitespace-pre-wrap wrap-break-word border-l-4 border-transparent px-3",
                            (line.startsWith("--- ") || line.startsWith("+++ ")) &&
                                "font-bold text-ink/55",
                            line.startsWith("@@") &&
                                "border-marker-blue bg-marker-blue/10 font-bold text-ink/70",
                            line.startsWith("+") && !line.startsWith("+++") &&
                                "border-marker-green bg-marker-green/15 text-ink",
                            line.startsWith("-") && !line.startsWith("---") &&
                                "border-marker-red bg-marker-red/10 text-ink",
                            !line.startsWith("+") && !line.startsWith("-") && !line.startsWith("@@") &&
                                "text-ink/70",
                        )}
                    >
                        {line || " "}
                    </div>
                ))}
            </div>

            <div className="flex justify-end border-t-2 border-ink bg-paper/70 p-3">
                <Button
                    type="button"
                    disabled={applied || disabled}
                    onClick={onApply}
                    className="h-9 rounded-none border-2 border-ink bg-marker-yellow px-4 font-black text-ink shadow-[2px_2px_0_var(--kraft)] transition-none hover:bg-marker-yellow/80 active:translate-y-px active:shadow-none"
                >
                    {applying ? (
                        <>
                            <LoaderCircle className="animate-spin"/>
                            正在应用
                        </>
                    ) : applied ? (
                        <>
                            <Check/>
                            已应用
                        </>
                    ) : (
                        <>
                            <Check/>
                            确认应用
                        </>
                    )}
                </Button>
            </div>
        </section>
    )
}

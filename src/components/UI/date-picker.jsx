"use client"

import * as React from "react"
import { useEffect, useId, useState, useMemo } from "react"
import dayjs from "dayjs"
import customParseFormat from "dayjs/plugin/customParseFormat"
import { uz } from "date-fns/locale"
import { Calendar as CalendarIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { Calendar } from "@/components/UI/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/UI/popover"

dayjs.extend(customParseFormat)

// Date | string | null -> JS Date | null
export const toDateObj = (v) => {
     if (!v) return null
     if (v instanceof Date) return Number.isNaN(v.getTime()) ? null : v
     if (typeof v === "string") {
          const s = v.trim()
          if (!s) return null
          if (/^\d{2}\.\d{2}\.\d{4}/.test(s)) {
               const p = dayjs(s, s.length > 10 ? DATETIME_FORMAT : DATE_FORMAT, true)
               if (p.isValid()) return p.toDate()
          }
          const d = new Date(s)
          return Number.isNaN(d.getTime()) ? null : d
     }
     return null
}

// Forma state'i uchun: Date -> "YYYY-MM-DD" (mahalliy vaqt) va aksincha
export const toISODate = (d) => (d ? dayjs(d).format("YYYY-MM-DD") : "")
export const fromISODate = (s) => (s ? dayjs(s, "YYYY-MM-DD").toDate() : null)

const DATE_FORMAT = "DD.MM.YYYY"
const DATETIME_FORMAT = "DD.MM.YYYY HH:mm"
const DATE_MAX = 10   // "DD.MM.YYYY"
const DATETIME_MAX = 16 // "DD.MM.YYYY HH:mm"

// Faqat raqamlardan format hosil qiladi — sana yoki sana+vaqt
function applyMask(raw, showTime) {
     const maxDigits = showTime ? 12 : 8
     let d = raw.replace(/\D/g, "").slice(0, maxDigits)

     if (!showTime) {
          if (d.length <= 2) return d
          if (d.length <= 4) return `${d.slice(0, 2)}.${d.slice(2)}`
          return `${d.slice(0, 2)}.${d.slice(2, 4)}.${d.slice(4, 8)}`
     }

     let out = ""
     const date = d.slice(0, 8)
     const time = d.slice(8, 12)

     if (date.length <= 2) out = date
     else if (date.length <= 4) out = `${date.slice(0, 2)}.${date.slice(2)}`
     else out = `${date.slice(0, 2)}.${date.slice(2, 4)}.${date.slice(4, 8)}`

     if (time.length > 0) {
          let hh = time.slice(0, 2)
          if (hh.length === 1 && parseInt(hh, 10) > 2) hh = "2"
          if (hh.length === 2 && parseInt(hh, 10) > 23) hh = "23"

          out += ` ${hh}`

          if (time.length > 2) {
               let mm = time.slice(2, 4)
               if (mm.length === 1 && parseInt(mm, 10) > 5) mm = "5"
               if (mm.length === 2 && parseInt(mm, 10) > 59) mm = "59"
               out += `:${mm}`
          }
     }

     return out
}

function parseText(text, showTime) {
     if (!showTime) {
          const parsed = dayjs(text, DATE_FORMAT, true)
          return parsed.isValid() ? parsed.toDate() : null
     }
     const parsed = dayjs(text, DATETIME_FORMAT, true)
     return parsed.isValid() ? parsed.toDate() : null
}

function formatText(d, showTime) {
     if (!d) return ""
     return dayjs(d).format(showTime ? DATETIME_FORMAT : DATE_FORMAT)
}

export function DatePicker({
     value,
     onChange,
     placeholder,
     showTime = false,
     label,
     className = "",
     inputClassName = "",
     disabled = false,
     error = false,
     id,
     maxDate,
     minDate,
     disabledDays,
     ...props
}) {
     const autoId = useId()
     const fieldId = id || `date-${autoId}`
     const MAX = showTime ? DATETIME_MAX : DATE_MAX
     const defaultPlaceholder = placeholder ?? (showTime ? "KK.OO.YYYY SS:DD" : "KK.OO.YYYY")

     const minDateObj = useMemo(() => toDateObj(minDate), [minDate])
     const maxDateObj = useMemo(() => toDateObj(maxDate), [maxDate])

     const clampToBounds = React.useCallback((targetDate) => {
          if (!targetDate) return null
          let d = new Date(targetDate)
          if (minDateObj) {
               if (showTime) {
                    if (d < minDateObj) d = new Date(minDateObj)
               } else {
                    if (dayjs(d).isBefore(dayjs(minDateObj), "day")) {
                         d = dayjs(minDateObj).startOf("day").toDate()
                    }
               }
          }
          if (maxDateObj) {
               if (showTime) {
                    if (d > maxDateObj) d = new Date(maxDateObj)
               } else {
                    if (dayjs(d).isAfter(dayjs(maxDateObj), "day")) {
                         d = dayjs(maxDateObj).startOf("day").toDate()
                    }
               }
          }
          return d
     }, [minDateObj, maxDateObj, showTime])

     const [open, setOpen] = useState(false)
     const [focused, setFocused] = useState(false)
     const [date, setDate] = useState(() => {
          const raw = toDateObj(value)
          return raw ? clampToBounds(raw) : null
     })
     const [month, setMonth] = useState(() => toDateObj(value) || new Date())
     const [text, setText] = useState(() => formatText(toDateObj(value), showTime))

     const isActive = focused || Boolean(text) || open

     useEffect(() => {
          if (value === undefined) return
          const next = toDateObj(value)
          const clamped = next ? clampToBounds(next) : null
          setDate(clamped)
          setText(formatText(clamped, showTime))
          if (clamped) setMonth(clamped)
     }, [value, showTime, clampToBounds])

     const emit = (d) => {
          const bounded = d ? clampToBounds(d) : null
          setDate(bounded)
          onChange?.(bounded)
     }

     const handleType = (e) => {
          const raw = e.target.value
          const masked = applyMask(raw, showTime)
          setText(masked)

          if (masked === "") {
               emit(null)
               return
          }
          if (masked.length === MAX) {
               const parsed = parseText(masked, showTime)
               if (parsed) {
                    const bounded = clampToBounds(parsed)
                    emit(bounded)
                    setText(formatText(bounded, showTime))
                    setMonth(bounded)
               }
          }
     }

     const handleBlur = () => {
          setFocused(false)
          if (text) {
               const parsed = parseText(text, showTime)
               if (parsed) {
                    const bounded = clampToBounds(parsed)
                    emit(bounded)
                    setText(formatText(bounded, showTime))
                    setMonth(bounded)
                    return
               }
          }
          setText(formatText(date, showTime))
     }

     const handleCalendarSelect = (d) => {
          if (!d) return
          let chosen = d
          if (showTime) {
               chosen = new Date(d)
               chosen.setHours(23, 59, 0, 0)
          }
          chosen = clampToBounds(chosen)
          emit(chosen)
          setText(formatText(chosen, showTime))
          setOpen(false)
     }

     const handleSelectToday = () => {
          let today = new Date()
          if (showTime) {
               today.setHours(23, 59, 0, 0)
          }
          today = clampToBounds(today)
          emit(today)
          setText(formatText(today, showTime))
          setMonth(today)
          setOpen(false)
     }

     const disabledConfig = React.useMemo(() => {
          if (disabledDays) return disabledDays
          const rules = []
          if (maxDateObj) {
               rules.push({ after: dayjs(maxDateObj).endOf("day").toDate() })
          }
          if (minDateObj) {
               rules.push({ before: dayjs(minDateObj).startOf("day").toDate() })
          }
          if (rules.length === 1) return rules[0]
          if (rules.length > 1) return rules
          return undefined
     }, [disabledDays, maxDateObj, minDateObj])

     const calendarNode = (
          <div className="flex flex-col">
               <Calendar
                    mode="single"
                    captionLayout="dropdown"
                    startMonth={new Date(new Date().getFullYear() - 5, 0)}
                    endMonth={maxDateObj ? new Date(maxDateObj.getFullYear(), maxDateObj.getMonth(), 1) : new Date(new Date().getFullYear() + 5, 11)}
                    selected={date}
                    month={month}
                    onMonthChange={setMonth}
                    locale={uz}
                    disabled={disabledConfig}
                    onSelect={handleCalendarSelect}
               />
               <div className="border-t border-[#E2E6F2] dark:border-[#2B3553] pt-2 mt-1 px-1 flex items-center justify-between">
                    <button
                         type="button"
                         onClick={handleSelectToday}
                         className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-[#3858C7]/10 hover:bg-[#3858C7]/20 text-[#3858C7] dark:text-[#6085FF] transition-colors cursor-pointer"
                    >
                         Bugun
                    </button>
                    {date && (
                         <button
                              type="button"
                              onClick={() => {
                                   emit(null)
                                   setText("")
                                   setOpen(false)
                              }}
                              className="text-xs font-medium text-[#8B90A5] hover:text-[#1A1D2E] dark:hover:text-white transition-colors cursor-pointer"
                         >
                              Tozalash
                         </button>
                    )}
               </div>
          </div>
     )

     if (label) {
          return (
               <div
                    onClick={() => document.getElementById(fieldId)?.focus()}
                    className={cn(
                         "relative flex h-10 flex-col justify-end rounded-[10px] border bg-white px-3 pb-1 pt-2.5 shadow-[0_1px_2px_rgba(0,0,0,0.05)] transition-all duration-200 cursor-text focus-within:border-[#0052D2] focus-within:ring-2 focus-within:ring-[#0052D2]/20 dark:bg-card",
                         error ? "border-destructive" : "border-[#E5E5E5] dark:border-white/10",
                         disabled && "cursor-not-allowed opacity-50",
                         className
                    )}
               >
                    <label
                         htmlFor={fieldId}
                         className={cn(
                              "pointer-events-none absolute left-3 transition-all duration-200 ease-out select-none",
                              isActive
                                   ? "top-1 text-[11px] font-normal leading-[14px] text-[#737373] dark:text-muted-foreground"
                                   : "top-1/2 -translate-y-1/2 text-[14px] font-normal text-[#737373] dark:text-muted-foreground"
                         )}
                    >
                         {label}
                    </label>
                    <input
                         id={fieldId}
                         value={text}
                         placeholder={isActive ? defaultPlaceholder : ""}
                         maxLength={MAX}
                         disabled={disabled}
                         onFocus={() => setFocused(true)}
                         onBlur={handleBlur}
                         onChange={handleType}
                         onKeyDown={(e) => {
                              if (e.key === "ArrowDown") { e.preventDefault(); setOpen(true) }
                         }}
                         className={cn(
                              "h-5 w-full bg-transparent pr-7 text-[13px] font-normal text-[#0A0A0A] outline-none transition-opacity duration-150 placeholder:text-[#A3A3A3] dark:text-white",
                              !isActive && "opacity-0",
                              inputClassName
                         )}
                         {...props}
                    />

                    <Popover open={open} onOpenChange={setOpen}>
                         <PopoverTrigger
                              render={
                                   <button
                                        type="button"
                                        disabled={disabled}
                                        aria-label="Sanani tanlash"
                                        className="absolute right-2 top-1/2 flex size-7 -translate-y-1/2 items-center justify-center rounded-md text-[#737373] transition-colors hover:bg-[#F5F5F5] hover:text-[#0A0A0A] disabled:opacity-50 dark:hover:bg-white/5 dark:hover:text-white cursor-pointer"
                                   >
                                        <CalendarIcon className="size-4" />
                                   </button>
                              }
                         />
                         <PopoverContent className="w-auto overflow-hidden p-0" align="end" alignOffset={-8} sideOffset={10}>
                              {calendarNode}
                         </PopoverContent>
                    </Popover>
               </div>
          )
     }

     return (
          <div className={cn("relative select-none", className)}>
               <input
                    id={fieldId}
                    value={text}
                    placeholder={defaultPlaceholder}
                    maxLength={MAX}
                    disabled={disabled}
                    onChange={handleType}
                    onBlur={handleBlur}
                    onKeyDown={(e) => {
                         if (e.key === "ArrowDown") { e.preventDefault(); setOpen(true) }
                    }}
                    className={cn(
                         "h-11 w-full rounded-xl border border-[#E2E6F2] dark:border-[#2B3553] bg-white dark:bg-[#121624] pl-3.5 pr-10 text-[13.5px] font-medium text-[#1A1D2E] dark:text-white outline-none transition-all placeholder:text-[#8B90A5] dark:placeholder:text-[#64748B] focus:border-[#3858C7] focus:ring-2 focus:ring-[#3858C7]/10 disabled:cursor-not-allowed disabled:opacity-50",
                         error && "border-destructive",
                         inputClassName
                    )}
                    {...props}
               />

               <Popover open={open} onOpenChange={setOpen}>
                    <PopoverTrigger
                         render={
                              <button
                                   type="button"
                                   disabled={disabled}
                                   aria-label="Sanani tanlash"
                                   className="absolute right-3.5 top-1/2 -translate-y-1/2 flex items-center justify-center text-[#5B6078] dark:text-[#94A3B8] hover:text-[#1A1D2E] dark:hover:text-white disabled:opacity-50 cursor-pointer"
                              >
                                   <CalendarIcon className="size-[17px]" />
                              </button>
                         }
                    />
                    <PopoverContent className="w-auto overflow-hidden p-2 bg-white dark:bg-[#161C2E] rounded-xl border border-[#E2E6F2] dark:border-[#2B3553] shadow-2xl z-50" align="start" sideOffset={6}>
                         {calendarNode}
                    </PopoverContent>
               </Popover>
          </div>
     )
}

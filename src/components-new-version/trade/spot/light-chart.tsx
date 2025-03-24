"use client"

import { useEffect, useRef } from "react"
import { LineSeries, ColorType, createChart, CrosshairMode } from "lightweight-charts"

interface ChartComponentProps {
  data?: { time: string; value: number }[]
  colors?: {
    backgroundColor?: string
    lineColor?: string
    textColor?: string
  }
}

const initialData = [
  { time: "2018-12-22", value: 32.51 },
  { time: "2018-12-23", value: 31.11 },
  { time: "2018-12-24", value: 27.02 },
  { time: "2018-12-25", value: 27.32 },
  { time: "2018-12-26", value: 25.17 },
  { time: "2018-12-27", value: 28.89 },
  { time: "2018-12-28", value: 25.46 },
  { time: "2018-12-29", value: 23.92 },
  { time: "2018-12-30", value: 22.68 },
  { time: "2018-12-31", value: 22.67 },
]

export function ChartComponent({ data = initialData, colors = {} }: ChartComponentProps) {
  const { backgroundColor = "rgba(30, 30, 30, 0.8)", lineColor = "#4B7BFF", textColor = "#D9D9D9" } = colors

  const chartContainerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!chartContainerRef.current) return

    const handleResize = () => {
      if (chartContainerRef.current) {
        chart.applyOptions({ width: chartContainerRef.current.clientWidth })
      }
    }

    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: backgroundColor },
        textColor,
      },
      width: chartContainerRef.current.clientWidth,
      height: 100,
      grid: {
        vertLines: {
          visible: false,
        },
        horzLines: {
          visible: false,
        },
      },
      // Hide the right price scale (y-axis)
      rightPriceScale: {
        visible: false,
      },
      // Hide the left price scale
      leftPriceScale: {
        visible: false,
      },
      // Hide the time scale (x-axis)
      timeScale: {
        visible: false,
      },
      // Remove the watermark
      // Configure crosshair - hide the lines but keep functionality
      crosshair: {
        mode: CrosshairMode.Normal,
        vertLine: {
          visible: false,
        },
        horzLine: {
          visible: false,
        },
      },
    })

    chart.timeScale().fitContent()

    const newSeries = chart.addSeries(LineSeries, {
      color: lineColor,
      lineWidth: 2,
      priceLineVisible: false,
      lastValueVisible: false,
      crosshairMarkerVisible: true,
      crosshairMarkerRadius: 5,
      crosshairMarkerBorderColor: lineColor,
      crosshairMarkerBackgroundColor: backgroundColor,
    })

    newSeries.setData(data)

    // Create fixed tooltip in top-left corner
    const toolTip = document.createElement("div")
    toolTip.style.position = "absolute"
    toolTip.style.display = "none"
    toolTip.style.padding = "4px 8px"
    toolTip.style.boxSizing = "border-box"
    toolTip.style.fontSize = "12px"
    toolTip.style.lineHeight = "1.2"
    toolTip.style.textAlign = "left"
    toolTip.style.zIndex = "1000"
    toolTip.style.pointerEvents = "none"
    toolTip.style.borderRadius = "4px"
    toolTip.style.backgroundColor = "rgba(30, 30, 30, 0.9)"
    toolTip.style.color = textColor
    toolTip.style.border = "1px solid rgba(255, 255, 255, 0.2)"
    toolTip.style.whiteSpace = "nowrap"

    // Position tooltip in top-left corner
    toolTip.style.bottom = "10px"
    toolTip.style.left = "10px"

    chartContainerRef.current.appendChild(toolTip)

    // Subscribe to crosshair move to update tooltip
    chart.subscribeCrosshairMove((param: any) => {
      if (chartContainerRef && chartContainerRef.current) {
        if (
          param.point === undefined ||
          !param.time ||
          param.point.x < 0 ||
          param.point.x > chartContainerRef.current.clientWidth ||
          param.point.y < 0 ||
          param.point.y > chartContainerRef.current.clientHeight
        ) {
          toolTip.style.display = "none"
        } else {
          const data = param.seriesData.get(newSeries)
          if (data) {
            toolTip.style.display = "block"
            const price = data.value

            // Format the date (DD/MM/YYYY)
            const date = new Date(data.time)
            const day = date.getDate().toString().padStart(2, "0")
            const month = (date.getMonth() + 1).toString().padStart(2, "0")
            const year = date.getFullYear()
            const formattedDate = `${day}/${month}/${year}`

            toolTip.innerHTML = `
            <div>Date: ${formattedDate}</div>
            <div>Price: ${price.toFixed(2)}</div>
          `
          }
        }
      }
    })

    window.addEventListener("resize", handleResize)

    return () => {
      window.removeEventListener("resize", handleResize)
      if (chartContainerRef.current && chartContainerRef.current.contains(toolTip)) {
        chartContainerRef.current.removeChild(toolTip)
      }
      chart.remove()
    }
  }, [data, backgroundColor, lineColor, textColor])

  return <div ref={chartContainerRef} className="w-full h-full" />
}

export function ChartDemo() {
  return (
    <ChartComponent
      data={initialData}
      colors={{
        backgroundColor: "rgba(0, 0, 0, 0)",
        lineColor: "#97EF83",
        textColor: "#97EF83",
      }}
    />
  )
}


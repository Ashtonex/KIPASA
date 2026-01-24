import { useMemo } from "react"

export function useMaraIntelligence(
    quantity: number,
    unitBuyPrice: number,
    extraCosts: { value: string }[],
    targetSellPrice: number
) {
    return useMemo(() => {
        // 1. Calculate True Costs (Absorption)
        const totalExtras = extraCosts.reduce((acc, curr) => acc + (parseFloat(curr.value) || 0), 0)
        const totalBatchCost = (unitBuyPrice * quantity) + totalExtras
        const trueUnitCost = quantity > 0 ? totalBatchCost / quantity : 0

        // 2. Generate Price Suggestions (Target Margins)
        const calculatePriceForMargin = (targetMarginPercent: number) => {
            // Formula: Price = Cost / (1 - Margin%)
            if (trueUnitCost === 0) return 0
            return trueUnitCost / (1 - (targetMarginPercent / 100))
        }

        const suggestions = {
            breakEven: trueUnitCost,
            conservative: calculatePriceForMargin(30), // 30% Margin
            growth: calculatePriceForMargin(50),      // 50% Margin
            premium: calculatePriceForMargin(70)      // 70% Margin
        }

        // 3. Financial Statement Projections
        const projectedRevenue = targetSellPrice * quantity
        const projectedCOGS = totalBatchCost
        const grossProfit = projectedRevenue - projectedCOGS
        const marginPercent = projectedRevenue > 0 ? (grossProfit / projectedRevenue) * 100 : 0
        const markupPercent = projectedCOGS > 0 ? (grossProfit / projectedCOGS) * 100 : 0

        // 4. Insights / Health Check
        let healthStatus: 'critical' | 'warning' | 'healthy' | 'exceptional' = 'healthy'
        let insightMessage = "Standard profit margins."

        if (targetSellPrice <= trueUnitCost) {
            healthStatus = 'critical'
            insightMessage = "CRITICAL WARNING: Selling at a loss. Price is below True Cost."
        } else if (marginPercent < 20) {
            healthStatus = 'warning'
            insightMessage = "Low Margin Risk. Operational costs (rent, salaries) might consume this profit."
        } else if (marginPercent > 60) {
            healthStatus = 'exceptional'
            insightMessage = "High Performance Asset. Exceptional returns projected."
        }

        return {
            trueUnitCost,
            totalBatchCost,
            suggestions,
            financials: {
                projectedRevenue,
                projectedCOGS,
                grossProfit,
                marginPercent,
                markupPercent
            },
            insight: {
                status: healthStatus,
                message: insightMessage
            }
        }
    }, [quantity, unitBuyPrice, extraCosts, targetSellPrice])
}
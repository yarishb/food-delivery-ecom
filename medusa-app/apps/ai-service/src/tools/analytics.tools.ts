import { tool } from '@langchain/core/tools';
import { z } from 'zod';
import { MedusaService } from '../medusa/medusa.service';

export const createAnalyticsTools = (medusaService: MedusaService) => {
  const checkStockShortagesTool = tool(
    async () => {
      const items = await medusaService.getInventoryItems();

      if (!items.length) {
        return JSON.stringify({
          message:
            'Дані про залишки відсутні — інвентаризація Medusa не налаштована.',
          items: [],
        });
      }

      const low = items
        .filter((item: any) => {
          const qty = item.stocked_quantity ?? 0;
          const threshold = item.reorder_level ?? 5;
          return qty <= threshold;
        })
        .map((item: any) => ({
          id: item.id,
          sku: item.sku,
          title: item.title || item.sku || 'Невідомий товар',
          current_stock: item.stocked_quantity ?? 0,
          reorder_level: item.reorder_level ?? 5,
        }));

      return JSON.stringify({ total_low_stock: low.length, items: low });
    },
    {
      name: 'check_stock_shortages',
      description:
        'Fetch live inventory levels from Medusa.js to find products that are low or out of stock.',
      schema: z.object({}),
    },
  );

  const getMenuAnalyticsReportTool = tool(
    async ({ periodDays }) => {
      const orders = await medusaService.getOrders({ limit: 500 });

      const cutoff = new Date();
      cutoff.setDate(cutoff.getDate() - periodDays);

      const recent = orders.filter(
        (o: any) => new Date(o.created_at) >= cutoff,
      );

      const counts: Record<string, { title: string; qty: number }> = {};
      for (const order of recent) {
        for (const item of order.items ?? []) {
          const key = item.title || 'Unknown';
          if (!counts[key]) counts[key] = { title: key, qty: 0 };
          counts[key].qty += item.quantity ?? 1;
        }
      }

      const ranked = Object.values(counts).sort((a, b) => b.qty - a.qty);

      return JSON.stringify({
        period_days: periodDays,
        total_orders: recent.length,
        top_items: ranked.slice(0, 10),
        bottom_items: ranked.slice(-5),
      });
    },
    {
      name: 'get_menu_analytics_report',
      description:
        'Analyze order history to see which menu items sell best or worst over a given period.',
      schema: z.object({
        periodDays: z
          .number()
          .describe('Number of past days to include in the analysis'),
      }),
    },
  );

  const generateKitchenProductionSheetTool = tool(
    async ({ targetDate }) => {
      const orders = await medusaService.getOrders({ limit: 500 });
      const target = new Date(targetDate);

      const dayOrders = orders.filter((o: any) => {
        const d = new Date(o.created_at);
        return (
          d.getFullYear() === target.getFullYear() &&
          d.getMonth() === target.getMonth() &&
          d.getDate() === target.getDate()
        );
      });

      const production: Record<string, { title: string; qty: number }> = {};
      for (const order of dayOrders) {
        for (const item of order.items ?? []) {
          const key = item.title || 'Unknown';
          if (!production[key]) production[key] = { title: key, qty: 0 };
          production[key].qty += item.quantity ?? 1;
        }
      }

      const sorted = Object.values(production).sort((a, b) => b.qty - a.qty);

      return JSON.stringify({
        date: targetDate,
        total_orders: dayOrders.length,
        production_items: sorted,
      });
    },
    {
      name: 'generate_kitchen_production_sheet',
      description:
        'Generate a kitchen production summary showing quantities of each dish to prepare for a given date based on real orders.',
      schema: z.object({
        targetDate: z
          .string()
          .describe('Target date in YYYY-MM-DD format'),
      }),
    },
  );

  return [
    checkStockShortagesTool,
    getMenuAnalyticsReportTool,
    generateKitchenProductionSheetTool,
  ];
};

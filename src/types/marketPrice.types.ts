import { MarketTrend } from "./enums";
export interface MarketPrice {
    id: number;
    crop_name: string;
    category: string;
    region: string;
    price: number | null;
    unit: string;
    trend: MarketTrend;
    source: string;
    date: string;
    specification: string;
}
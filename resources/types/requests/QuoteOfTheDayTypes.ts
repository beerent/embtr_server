import { QuoteOfTheDay } from "../../schema";
import { Response } from "./RequestTypes";

export interface CreateQuoteOfTheDayRequest {
  quote: string,
  author?: string
}

export interface CreateQuoteOfTheDayResponse extends Response {
  quoteOfTheDay?: QuoteOfTheDay
}

export interface GetQuoteOfTheDayResponse extends Response {
  quoteOfTheDay?: QuoteOfTheDay
}

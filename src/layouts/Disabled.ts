import { QRect } from "../types/qt";
import { Window } from "../window";
import { Layout } from "../types/layout";
import { BaseLayout } from "./BaseLayout";

export class Disabled extends BaseLayout {
  name: string = "Disabled";
  limit: number = 0;
}

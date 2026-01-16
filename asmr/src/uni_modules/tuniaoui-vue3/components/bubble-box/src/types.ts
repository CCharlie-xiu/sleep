export interface BubbleBoxOptionItemData {
  text: string
  icon: string
  disabled: boolean
  color: BubbleBoxOptionDataColor
  openType: string
}

export interface BubbleBoxOptionDataColor {
  class: string
  style: string
}

export type BubbleBoxOptionData = BubbleBoxOptionItemData[]

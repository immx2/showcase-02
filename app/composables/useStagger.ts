/**
 * Returns a function that produces v-bind-ready attrs ({ class, style })
 * for card-enter stagger animations. Call it with the item's position index;
 * the base offset is added automatically.
 *
 * Usage:
 *   const stagger = useStagger(props.baseIndex)
 *   <CardKpi v-bind="stagger(i)" />
 */
export function useStagger(base: number = 0) {
  return (i = 0) => ({
    class: 'card-enter',
    style: { '--stagger-index': base + i },
  })
}

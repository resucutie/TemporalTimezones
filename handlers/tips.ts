import * as Temporal from "temporal-polyfill"

let tipList = [
    `The best candidate for your current timezone is \`${Temporal.Now.timeZone().id}\``,
    `Your current offset is \`${Temporal.Now.timeZone().getOffsetStringFor(Temporal.Now.instant())}\` UTC`,
    `We support UTC offsets, but we __recommend__ to use cities names due to DSTs, and uh... imagine having to type \`+05:45\` for a friend in Nepal`,
]

export default function (withMarkdown: boolean = true) {
    let tip = tipList[Math.floor(Math.random() * tipList.length)]

    if (!withMarkdown){
        tip.replace(/`/g, "")
    }
    
    return tip
}
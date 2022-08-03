import * as Temporal from "temporal-polyfill"
import * as webpack from "ittai/webpack";
const { React } = webpack;
import styles from "./Timer.scss"
import { useTemporalUpdate } from "../hooks/useTemporalUpdate";
import * as settings from "ittai/settings"
import TimezoneWrapper from "./TimezoneWrapper";
import { useTDB } from "../handlers/timezonedb";
import { User } from "../timezonedb";
import { Spinner, TooltipContainer } from "ittai/components"


interface Props {
    tpUpdateFunc?: () => any
    userId?: string
}

export default ({
    tpUpdateFunc = () => Temporal.Now.instant(),
    userId,
}: Props) => {
    const [loading, user] = useTDB({ discordID: userId })

    const shouldRender = Boolean(
        Boolean(tpUpdateFunc()) || loading || Boolean((user as User)?.timezone)
    )

    console.log(user, !(loading || !userId))

    return (
        <>
            {shouldRender && (
                <div className={styles["clock"]}>
                    {!(loading || !userId) || Boolean(tpUpdateFunc()) ? (
                        <TimezoneWrapper
                            tpFunc={
                                Boolean((user as User)?.timezone)
                                    ? () => {
                                          return Temporal.Now.instant().toZonedDateTimeISO(
                                              (user as User).timezone
                                          )
                                      }
                                    : tpUpdateFunc
                            }
                        />
                    ) : (
                        <TooltipContainer text="Fetching TimezoneDB">
                            <Spinner type={Spinner.Type.PULSING_ELLIPSIS} />
                        </TooltipContainer>
                    )}
                </div>
            )}
        </>
    )
}
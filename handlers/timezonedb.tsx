import * as Temporal from "temporal-polyfill"
import * as webpack from "ittai/webpack"
import { User } from "../timezonedb"
import * as settings from "ittai/settings"
import TimezoneWrapper from "../components/TimezoneWrapper"
import { Spinner, TooltipContainer } from "ittai/components"
const {
    React, React: { useState, useEffect },
} = webpack

export const HOST = "http://localhost:3001"

interface useTDBProps {
    discordID?: string
}
export const useTDB = ({ discordID }: useTDBProps, force = false) => {
    if (force || !settings.get("tdb", true))
        return [false, undefined, new Error("TimezoneDB disabled")]
    const [tdbUser, setTdbUser] = useState<User>()
    const [loading, setLoading] = useState<boolean>(true)
    const [error, setError] = useState<Error | undefined>()

    useEffect(() => {
        fetch(`${HOST}/api/users/discord/${discordID}`)
            .then((res) => {
                if (res.ok) return res.json()
                else
                    res.text().then((err) => {
                        throw err
                    })
            })
            .then((user: User) => setTdbUser(user))
            .catch((err) => {
                console.error(err)
                setError(err)
            })
            .finally(() => setLoading(false))
    }, [])

    return [loading, tdbUser, error]
}

interface Props {
    tpFunc?: () => any
    userId?: string
}
export const TDBTimezoneWrapper = ({
    tpFunc: tpUpdateFunc = () => Temporal.Now.instant(),
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
                <>
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
                </>
            )}
        </>
    )
}

export default {
    HOST,
    useTDB,
}

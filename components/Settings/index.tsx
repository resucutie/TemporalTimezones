import * as toast from "ittai/toast"
import * as webpack from "ittai/webpack"
const {
    React, React: {
        useReducer, useEffect, useState
    },
    ModalActions
} = webpack
import { Avatar, Button, SwitchItem, Category, DiscordIcon, Text, TextInput, Forms, Spinner, Flex } from "ittai/components";
import { Users } from "ittai/stores";
import * as settings from "ittai/settings"
import * as Temporal from "temporal-polyfill"
import UserManager from "../../handlers/user";
import AddUserModal from "./AddUserModal";
import styles from "./index.scss"
import { UserID, UserObject } from "ittai";
import { useTemporalUpdate } from "../../hooks/useTemporalUpdate";
import Timer from "../Timer";
import getTip from "../../handlers/tips";
import updateMessages from "../../utils/updateMessages";
import debounce from "../../utils/debounce";
import TimezoneWrapper from "../TimezoneWrapper";

const MarkdownParser = webpack.findByProps("renderMessageMarkupToAST").default

const updateMessagesDebounce = debounce(() => {
    updateMessages()
    toast.show("Updated the currently loaded messages!")
})

export default () => {
    console.log(Text)
    const [, forceUpdate] = useReducer(n => n + 1, 0);
    const [tip, setTip] = useState<string>("");
    useEffect(() => setTip(getTip()), []);
    
    return (
        <>
            <Category
                title={
                    <CategoryIconTitle icon="PersonAdd">
                        Local User List
                    </CategoryIconTitle>
                }
                description="Manually set which timezones you want to apply for your friends"
            >
                <div className={styles["user-list"]}>
                    {Object.entries(UserManager.getAll())
                        .sort(([aId], [bId]) => {
                            const a = Users.getUser(aId).username,
                                b = Users.getUser(bId).username
                            return a > b ? 1 : a < b ? -1 : 0
                        })
                        .map(([id, userSettings]) => (
                            <UserItem
                                id={id}
                                userSettings={userSettings}
                                onDelete={() => {
                                    UserManager.remove(id)
                                    forceUpdate()
                                }}
                                onEdit={() =>
                                    ModalActions.openModal((h: Object) => (
                                        <AddUserModal
                                            user={Users.getUser(id)}
                                            modalRootProps={h}
                                            onChooseUser={(user, timezone) => {
                                                UserManager.edit(user.id, {
                                                    timeZone: timezone,
                                                })
                                                forceUpdate()
                                            }}
                                        />
                                    ))
                                }
                            />
                        ))}

                    <Button
                        className={styles["add-user-button"]}
                        onClick={() =>
                            ModalActions.openModal((h: Object) => (
                                <AddUserModal
                                    modalRootProps={h}
                                    onChooseUser={(user, timezone) => {
                                        UserManager.add(user.id, {
                                            timeZone: timezone,
                                        })
                                        forceUpdate()
                                    }}
                                />
                            ))
                        }
                    >
                        Add a new user
                    </Button>
                </div>
            </Category>

            <Category
                title={
                    <CategoryIconTitle icon="Globe">
                        TimezoneDB
                    </CategoryIconTitle>
                }
                description="Online database where you can fetch user's timezones. Simmilar to PronounDB"
            >
                <SwitchItem
                    value={settings.get("tdb", true)}
                    onChange={() =>
                        settings.set("tdb", !settings.get("tdb", true))
                    }
                >
                    Enable
                </SwitchItem>

                <URLTDBForm />
            </Category>

            <Category
                title={
                    <CategoryIconTitle icon="HourglassCircle">
                        Timer Display
                    </CategoryIconTitle>
                }
                description="Customize how you want to display the current time"
            >
                <div className={styles["preview"]}>
                    <Timer
                        tpUpdateFunc={() =>
                            Temporal.PlainDateTime.from(
                                Temporal.Now.instant().toString()
                            )
                        }
                    />
                </div>
                <SwitchItem
                    value={settings.get("seconds", false)}
                    onChange={() =>
                        settings.set("seconds", !settings.get("seconds", false))
                    }
                >
                    Enable seconds
                </SwitchItem>
            </Category>

            <Category
                title={
                    <CategoryIconTitle icon="Person">
                        User Popout
                    </CategoryIconTitle>
                }
                description="Displays the timer in the user popout"
            >
                <SwitchItem
                    value={settings.get("userpopout", true)}
                    onChange={() =>
                        settings.set(
                            "userpopout",
                            !settings.get("userpopout", false)
                        )
                    }
                >
                    Enable
                </SwitchItem>
            </Category>

            <Category
                title={
                    <CategoryIconTitle icon="ChatBubble">
                        Messages
                    </CategoryIconTitle>
                }
                description="Displays very cool timers in the messages"
            >
                <SwitchItem
                    value={settings.get("timestamp-message", true)}
                    onChange={() => {
                        settings.set(
                            "timestamp-message",
                            !settings.get("timestamp-message", false)
                        )
                        updateMessagesDebounce()
                    }}
                >
                    Show the message's timestamp according to the user's
                    timezone
                </SwitchItem>
                <SwitchItem
                    value={settings.get("timestamp-current", false)}
                    onChange={() => {
                        settings.set(
                            "timestamp-current",
                            !settings.get("timestamp-current", false)
                        )
                        updateMessagesDebounce()
                    }}
                >
                    Show the user's current time in messages
                </SwitchItem>
            </Category>

            <Text color={Text.Colors.MUTED}>
                Tip:{" "}
                {MarkdownParser(Object.assign({}, { content: tip })).content}
            </Text>
        </>
    )
}


const URLTDBForm = () => {
    const [tdbUrl, setTDBUrl] = useState<string>(
        settings.get("tdb-url", "http://localhost:3001")
    )
    const [fetching, setFetch] = useState<boolean>(false)
    const [tdbUrlError, setTDBUrlError] = useState<boolean>(false)

    useEffect(() => {
        const timeout = 8000
        const controller = new AbortController()
        const id = setTimeout(() => controller.abort(), timeout)
        
        setFetch(true)

        fetch(`${tdbUrl}/api/status`, {
            signal: controller.signal,
        } as any)
            .then((res) => {
                settings.set("tdb-url", tdbUrl)
                setTDBUrlError(!res.ok)
            })
            .catch(() => setTDBUrlError(true))
            .finally(() => setFetch(false))
        
        clearTimeout(id)

        return () => {
            controller.abort()
            setTDBUrlError(false)
        }
    }, [tdbUrl])

    return (
        <Forms.FormItem>
            <Forms.FormTitle>
                <Flex>
                    TimezoneDB URL
                    {fetching && (
                        <Spinner type={Spinner.Type.PULSING_ELLIPSIS} />
                    )}
                </Flex>
            </Forms.FormTitle>
            <TextInput
                value={tdbUrl}
                onChange={setTDBUrl}
                error={tdbUrlError ? "Invalid URL" : false}
            />
        </Forms.FormItem>
    )
}

interface UserItemProps {
    id: UserID,
    userSettings: SettingsUserObject
    onEdit: () => void
    onDelete: () => void
}
const UserItem = ({ id, userSettings, onEdit, onDelete }: UserItemProps) => {
    const discordUser: UserObject = Users.getUser(id)

    return <div className={styles["item"]}>
        <Avatar src={discordUser.getAvatarURL(false, true)} size={Avatar.Sizes.SIZE_20} />
        <span className={styles["username"]}>{discordUser?.username}</span>
        <span className={styles["current-time"]}>
            <TimezoneWrapper tpFunc={() => Temporal.Now.instant().toZonedDateTimeISO(userSettings.timeZone)} />
        </span>
        <div className={styles["controls"]}>
            <Button size={Button.Sizes.ICON} onClick={onEdit}>
                <DiscordIcon name="Pencil" width="16" height="16" />
            </Button>
            <Button size={Button.Sizes.ICON} color={Button.Colors.RED} onClick={onDelete}>
                <DiscordIcon name="Trash" width="16" height="16" />
            </Button>
        </div>
    </div>
}

const CategoryIconTitle = ({ children, icon }: { children: React.ReactNode, icon: string }) => {
    return <div style={{ display: "flex", flexDirection: "row", alignItems: "center" }}>
        <DiscordIcon name={icon as any} width="16" height="16" />
        <span style={{ marginLeft: "6px" }}>{children}</span>
    </div>
}
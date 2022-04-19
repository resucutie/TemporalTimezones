import UserManager from "../../handlers/user";
import * as webpack from "ittai/webpack";
const {
    React, React: {
        useReducer, useEffect, useState
    },
    ModalActions
} = webpack
import { Avatar, Button, SwitchItem, Category, DiscordIcon, Text } from "ittai/components";
import { Users } from "ittai/stores";
import AddUserModal from "./AddUserModal";
import styles from "./index.scss"
import { UserID, UserObject } from "ittai";
import { useTemporalUpdate } from "../../hooks/useTemporalUpdate";
import * as Temporal from "temporal-polyfill"
import * as settings from "ittai/settings"
import Timer from "../Timer";
import getTip from "../../handlers/tips";
import updateMessages from "../../utils/updateMessages";
import debounce from "../../utils/debounce";

const MarkdownParser = webpack.findByProps("renderMessageMarkupToAST").default

export default () => {
    const [, forceUpdate] = useReducer(n => n + 1, 0);
    const [tip, setTip] = useState<string>("");

    useEffect(() => setTip(getTip()), []);
    
    return <>
        <Category 
            title={<CategoryIconTitle icon="PersonAdd">Local User List</CategoryIconTitle>}
            description="Manually set which timezones you want to apply for your friends"
        >
            <div className={styles["user-list"]}>
                {Object.entries(UserManager.getAll()).sort(([aId], [bId]) => {
                    const a = Users.getUser(aId).username,
                          b = Users.getUser(bId).username
                    return a > b ? 1 : a < b ? -1 : 0
                }).map(([id, userSettings]) => <UserItem
                        id={id}
                        userSettings={userSettings}
                        onDelete={() => {
                            UserManager.remove(id)
                            forceUpdate()
                        }}
                        onEdit={() => ModalActions.openModal((h: Object) => <AddUserModal user={Users.getUser(id)} modalRootProps={h}
                            onChooseUser={(user, timezone) => {
                                UserManager.edit(user.id, { timeZone: timezone })
                                forceUpdate()
                            }}
                        />)}
                    />
                )}

                <Button
                    className={styles["add-user-button"]}
                    onClick={() => ModalActions.openModal(
                        (h: Object) => <AddUserModal modalRootProps={h} onChooseUser={(user, timezone) => {
                            UserManager.add(user.id, { timeZone: timezone })
                            forceUpdate()
                        }} />
                    )}
                >Add a new user</Button>
            </div>
        </Category>

        <Category title={<CategoryIconTitle icon="HourglassCircle">Timer Display</CategoryIconTitle>} description="Customize how you want to display the current time">
            <div className={styles["preview"]}>
                <Timer tpUpdateFunc={() => Temporal.PlainDateTime.from(Temporal.Now.instant().toString())} />
            </div>
            <SwitchItem
                value={settings.get("seconds", false)}
                onChange={() => settings.set("seconds", !settings.get("seconds", false)) }
            >Enable seconds</SwitchItem>
        </Category>

        <Category title={<CategoryIconTitle icon="Person">User Popout</CategoryIconTitle>} description="Displays the timer in the user popout">
            <SwitchItem
                value={settings.get("userpopout", true)}
                onChange={() => settings.set("userpopout", !settings.get("userpopout", false))}
            >Enable</SwitchItem>
        </Category>

        <Category title={<CategoryIconTitle icon="ChatBubble">Messages</CategoryIconTitle>} description="Displays very cool timers in the messages">
            <SwitchItem
                value={settings.get("timestamp-message", true) }
                onChange={() => {
                    settings.set("timestamp-message", !settings.get("timestamp-message", false))
                    
                    debounce(() => updateMessages())() //debounce because lag
                }}
            >Show the message's timestamp</SwitchItem>
        </Category>

        <Text color={Text.Colors.MUTED}>Tip: {MarkdownParser(Object.assign({}, { content: tip })).content}</Text>
    </>
}



interface UserItemProps {
    id: UserID,
    userSettings: SettingsUserObject
    onEdit: () => void
    onDelete: () => void
}
const UserItem = ({ id, userSettings, onEdit, onDelete }: UserItemProps) => {
    const time = useTemporalUpdate(() => Temporal.Now.instant().toZonedDateTimeISO(userSettings.timeZone))
    
    const discordUser: UserObject = Users.getUser(id)

    return <div className={styles["item"]}>
        <Avatar src={discordUser.getAvatarURL(false, true)} size={Avatar.Sizes.SIZE_20} />
        <span className={styles["username"]}>{discordUser?.username}</span>
        <span className={styles["current-time"]}>
            {time.toPlainTime().toString({ smallestUnit: settings.get("seconds", false) ? 'second' : 'minute' })}
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
        <DiscordIcon name={icon} width="16" height="16" />
        <span style={{ marginLeft: "6px" }}>{children}</span>
    </div>
}
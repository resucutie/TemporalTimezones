import UserManager from "../../handlers/user";
import * as webpack from "ittai/webpack";
const {
    React, React: {
        useState, useReducer
    },
    ModalActions
} = webpack
import { Avatar, Button } from "ittai/components";
import { Users } from "ittai/stores";
import AddUserModal from "./AddUserModal";
import styles from "./index.scss"
import { UserID, UserObject } from "ittai";
import { useTemporalUpdate } from "../../hooks/useTemporalUpdate";
import * as Temporal from "temporal-polyfill"


export default () => {
    const [, forceUpdate] = useReducer(n => n + 1, 0);
    
    return <>
        <div className={styles["user-list"]}>
            {Object.entries(UserManager.getAll()).map(
                ([id, userSettings]) => <UserItem id={id} userSettings={userSettings} onDelete={() => {
                    UserManager.remove(id)
                    forceUpdate()
                }}/>
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
    </>
}

interface UserItemProps {
    id: UserID,
    userSettings: SettingsUserObject
    onDelete: () => void
}

const UserItem = ({ id, userSettings, onDelete }: UserItemProps) => {
    const time = useTemporalUpdate(() => Temporal.Now.instant().toZonedDateTimeISO(userSettings.timeZone))
    
    const discordUser: UserObject = Users.getUser(id)

    return <div className={styles["item"]}>
        <Avatar src={discordUser.getAvatarURL(false, true)} size={Avatar.Sizes.SIZE_20} />
        <span className={styles["username"]}>{discordUser?.username}</span>
        <span className={styles["current-time"]}>{time.toPlainTime().toString({ smallestUnit: 'second' })}</span>
        <a onClick={onDelete}>delete</a>
    </div>
}
import * as webpack from "ittai/webpack";
const {
    React, React: {
        useState, useEffect, useCallback
    }
} = webpack
import { Users } from "ittai/stores";
import { Modal, Avatar, TextInput, Button, Text, Forms } from "ittai/components";
import { UserObject } from "ittai";
import { TimeZoneArg } from "temporal-polyfill";
import isTimezone from "../../utils/isTimezone";
import getTimezoneListInCategories from "../../utils/getTimezoneListInCategories";
import timezoneListName from "../../utils/timezoneListName.json";
import styles from "./AddUserModal.scss"
import reactStringReplace from 'react-string-replace';
import debounce from "../../utils/debounce";

const discordClasses = webpack.findByProps("headerContainer", "modalRoot")

const PAGE = {
    SELECT_USER: 0,
    SELECT_TIMEZONE: 1
}

// Generated by Github Copilot. Thanks!
const getLimitedUserList = (limit: number, search = ""): Array<UserObject> => {
    // get a list of the users and sort them
    const userList = Users.getUsers()
    const userListKeysSorted = Object.keys(userList)
        .sort(() => Math.random() - 0.5)
        .filter(userId => (
            userId !== Users.getCurrentUser().id &&
            Users.getUser(userId).username.toLowerCase().includes(search.toLowerCase())
        ))

    // check if it should user the "limit" var or not
    const userListLimit = userListKeysSorted.length > limit ? limit : userListKeysSorted.length
    
    //slice them, make a parallel object, and return it
    const userListLimited = userListKeysSorted.slice(0, userListLimit)
    const userListLimitedObject = userListLimited.reduce((acc, key) => {
        // @ts-ignore
        acc[key] = userList[key]
        return acc
    }, {})
    return Object.values(userListLimitedObject)
}


interface Props {
    modalRootProps: Object,
    user?: UserObject | undefined
    onChooseUser: (user: UserObject, timezone: TimeZoneArg) => void
}
export default ({ modalRootProps, user: definedUser = undefined, onChooseUser}: Props) => {
    const [page, setPage] = useState<number>(definedUser ? PAGE.SELECT_TIMEZONE : PAGE.SELECT_USER)
    const [selectedUser, setSelectedUser] = useState<UserObject | undefined>(definedUser)
    const [selectedTimezone, setSelectedTimezone] = useState<TimeZoneArg | undefined>()

    return <Modal.ModalRoot size={Modal.ModalSize.LARGE} {...modalRootProps}>
        <Modal.ModalHeader separator={false} className={discordClasses?.headerContainer}>
            <div className={styles["instructions-text"]}>
                <div className={styles["icon"]}>
                    {page === PAGE.SELECT_USER && <></>}
                    {page === PAGE.SELECT_TIMEZONE && <img
                        src="https://media.discordapp.net/attachments/892432702651924580/960262560299495554/earth.png"
                        width="75"
                        height="75"
                        style={{ imageRendering: "pixelated" }}
                    />}
                </div>
                <div className={styles["text"]}>
                    {page === PAGE.SELECT_USER && <>
                        <Text size={Text.Sizes.SIZE_20}><b>Step 1/2</b></Text>
                        <Text size={Text.Sizes.SIZE_16}>Select somebody to add a timezone</Text>
                    </>}
                    {page === PAGE.SELECT_TIMEZONE && <>
                        <Text size={Text.Sizes.SIZE_20}><b>Step 2/2</b></Text>
                        <Text size={Text.Sizes.SIZE_16}>Add a timezone to {selectedUser?.username}</Text>
                    </>}
                </div>
            </div>
        </Modal.ModalHeader>
        <Modal.ModalContent>
            <div className={styles["wrapper"]}>
                {page === PAGE.SELECT_USER && <SelectUserScreen
                    onChooseUser={(user) => setSelectedUser(user)}
                />}
                {page === PAGE.SELECT_TIMEZONE && <SelectTimezoneScreen 
                    user={selectedUser}
                    onChooseTimezone={(tz) => {
                        setSelectedTimezone(tz)
                    }}
                />}
            </div>
        </Modal.ModalContent>
        <Modal.ModalFooter>
            <>
                {page === PAGE.SELECT_USER && <Button onClick={() => setPage(PAGE.SELECT_TIMEZONE)} disabled={!selectedUser}>Next</Button>}
                {page === PAGE.SELECT_TIMEZONE && <Button
                    onClick={() => {
                        if (!selectedUser || !selectedTimezone) return
                        onChooseUser(selectedUser, selectedTimezone)
                        // @ts-ignore
                        modalRootProps.onClose()
                    }}
                    disabled={!selectedUser || !isTimezone(selectedTimezone)}
                >Add user</Button>}
                <Button
                    color={Button.Colors.TRANSPARENT}
                    look={Button.Looks.LINK}
                    onClick={() => {
                        // @ts-ignore
                        modalRootProps.onClose()
                    }}
                >Cancel</Button>
            </>
        </Modal.ModalFooter>
    </Modal.ModalRoot>
}

// Select User Screen
interface SelectUserScreenProps {
    onChooseUser: (user: UserObject) => void
}
const SelectUserScreen = ({ onChooseUser }: SelectUserScreenProps) => {
    const [search, setSearch] = useState<string>("")
    const [limitedUsers, setLimitedUsers] = useState<UserObject[]>()
    const [selectedUserId, setSelectedUserId] = useState<string>()

    useEffect(() => {
        setLimitedUsers(getLimitedUserList(100, search))
    }, [search])

    return <>
        <TextInput
            placeholder="Search for users"
            onChange={(value) => setSearch(value)}
            value={search}
        />
        <div className={styles["user-grid"]}>
            {limitedUsers?.map(user => <div key={user.id}
                    className={`${styles["user-grid-item"]} ${selectedUserId === user.id ? styles["selected"] : ""}`}
                    onClick={() => {
                        onChooseUser(user)
                        setSelectedUserId(user.id)
                    }}
                >
                    <Avatar src={user.getAvatarURL(false, true)} size={Avatar.Sizes.SIZE_16} />
                    <span className={styles["grid-username"]}>
                        {reactStringReplace(user.username, search, (match) => <b>{match}</b>)}
                    </span>
                </div>
            )}
        </div>
    </>
}

//Select Timezone Screen
const handleTimezoneDisplay = (searchTz: string, onSelection: (tz: TimeZoneArg) => void, searchOverlay?: string) => {
    const tzCategory = getTimezoneListInCategories(timezoneListName.filter((tz: string) => (
        tz !== searchTz &&
        tz.toLowerCase().includes(searchTz.toLowerCase().normalize("NFD").replace(/\p{Diacritic}/gu, "").replace(/ /g, "_"))
    )))

    const sortedTzCategory = Object.keys(tzCategory).sort().reduce((acc: {[key: string]: string[]}, key: string) => {
        acc[key] = tzCategory[key]
        return acc
    }, {})

    return Object.keys(sortedTzCategory).map((category: string) => <>
        <div key={category} className={styles["timezone-category"]}>
            <Forms.FormTitle size={Text.Sizes.SIZE_16}>{category}</Forms.FormTitle>
            <div className={styles["timezone-subcategories"]}>
                {tzCategory[category].map((tz: string) => <>
                    <div key={tz}
                        className={styles["timezone-search-item"]}
                        onClick={() => onSelection(tz)}
                    >
                        {searchOverlay ? reactStringReplace(tz, searchOverlay, (match) => <b>{match}</b>) : tz}
                    </div>
                </>)}
            </div>
        </div>
    </>)
}

interface SelectTimezoneScreenProps {
    onChooseTimezone: (tz: TimeZoneArg) => void
    user: UserObject | undefined
}
const SelectTimezoneScreen = ({ onChooseTimezone, user }: SelectTimezoneScreenProps) => {
    const [timezone, setTimezone] = useState<TimeZoneArg>("")
    const [timezoneError, setTimezoneError] = useState<boolean>(false)
    return <div style={{display: "flex", flexDirection: "column", alignItems: "center"}}>
        <div className={styles["timezone-card"]}>
            {user && <>
                <Avatar src={user.getAvatarURL(false, true).replace("?size=16", "")} size={Avatar.Sizes.SIZE_120} />
                <Text size={Text.Sizes.SIZE_20} className={styles["card-username"]}><b>{user.username}#{user.discriminator}</b></Text>
            </>}
            <TextInput className={styles["timezone-input"]}
                placeholder="Timezone"
                onChange={(value) => {
                    setTimezone(value)
                    onChooseTimezone(value)
                    if (!isTimezone(value)) {
                        setTimezoneError(true)
                    } else {
                        setTimezoneError(false)
                    }
                }}
                value={timezone as string}
                error={timezoneError ? "Invalid timezone" : false}
            />
        </div>
        <div className={styles["timezone-search"]}>
            {handleTimezoneDisplay(timezone as string, (tz) => {
                setTimezone(tz)
                setTimezoneError(false)
                onChooseTimezone(tz)
            }, timezone as string)}
        </div>
    </div>
}
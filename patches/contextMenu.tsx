import * as patcher from "ittai/patcher";
import * as webpack from "ittai/webpack";
import * as logger from "ittai/logger";
import { ContextMenu } from "ittai/components";
import { findInReactTree } from "ittai/utilities"
import AddUserModal from "../components/Settings/AddUserModal";
import UserManager from "../handlers/user";
import { UserObject } from "ittai";

// please i need to relearn how to patch a context menu

const { React, ModalActions } = webpack

const patchDMContextMenu = (props: {user: UserObject, [key: string]: any}, res: any) => {
    let items: any[] = res?.props?.children?.[4]?.props?.children?.[2]?.props?.children //yeah, this is a """bit""" hacky
    if (!items) return res
    items.unshift(<ContextMenu.MenuItem
        label="Add a timezone locally"
        id="timezone-local-add-user"
        action={() => {
            ModalActions.openModal((h: Object) => <AddUserModal modalRootProps={h} user={props.user} onChooseUser={(user, timezone) => {
                UserManager.add(user.id, { timeZone: timezone })
            }} />)
        }}
    />)
}

let hasRan = false
const patchGuildContextMenu = (props: { user: UserObject, [key: string]: any }, returnValue: any) => {
    // let GuildContextMenu: any = findInReactTree(returnValue, (e: any) => e.type?.displayName === "GuildChannelUserContextMenu");
    // if (!GuildContextMenu) return;
    // hasRan = true
    const OgGuildContextMenu = returnValue.type
    returnValue.type = function (...args: any) {
        const res = OgGuildContextMenu.apply(this, args)

        // console.log(res)

        let items: any[] = res?.props?.children?.[0]?.props?.children?.[4]?.props?.children //yeah, this is a """bit""" hacky
        if (!items) return res
        items.unshift(<ContextMenu.MenuItem
            label="Add a timezone locally"
            id="timezone-local-add-user"
            action={() => {
                ModalActions.openModal((h: Object) => <AddUserModal modalRootProps={h} user={props.user} onChooseUser={(user, timezone) => {
                    UserManager.add(user.id, { timeZone: timezone })
                }} />)
            }}
        />)

        return res
    }
}

const updateContextMenuRefs = new Set();
const TemporalTimezoneContextMenuTamper = ({ogFunc, ...props}: any) => {
    const [, forceUpdate] = React.useReducer(e => !e, true);

    React.useEffect(() => {
        const listener = () => forceUpdate();
        updateContextMenuRefs.add(listener);

        return () => void updateContextMenuRefs.delete(listener);
    });

    const rendered = ogFunc.call(this, props)

    try {
        let mainRender = rendered.props.children
        const ogMainRender = mainRender?.type
        if (ogMainRender && ["DMUserContextMenu"].some(e => ogMainRender?.displayName === e)) {
            mainRender.type = (...args: any) => {
                const res = ogMainRender.apply(this, args)
                if (ogMainRender?.displayName === "DMUserContextMenu") patchDMContextMenu(props, res)
                // if (ogMainRender?.displayName === "GuildChannelUserContextMenu") {
                //     React.useEffect(() => {
                //         console.log(props, res)
                //     })
                // }
                return res
            }
        }
    } catch (error) {
        logger.error("Failed to run ContextMenu injections:", error);
    }

    return rendered
}

export default function () {
    /** @see {@link https://github.com/HolyMod/HolyMod/blob/dbca91eac6fb5f8a8821f34c415b8c9e297c3ae1/src/renderer/autopatchers/contextmenu.tsx#L182-L203} */
    patcher.before("UserBannerPatch", webpack.findByProps("openContextMenu"), "openContextMenuLazy", (args) => {
        args[1] = (original => ((ogArgs:any) => original(ogArgs).then((render:any) => ((props:any) => {
            const returnValue = render(props);
            Object.assign(returnValue.props, { ogFunc: returnValue.type })
            returnValue.key = returnValue.type.displayName;
            returnValue.type = TemporalTimezoneContextMenuTamper;
            return returnValue;
        }))))(args[1]);
    })
}
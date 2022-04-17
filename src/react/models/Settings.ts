interface Bindings {
    forwardKey: string
    backKey: string
    leftKey: string
    rightKey: string
}

interface Settings {
    primaryBindings: Bindings
    secondaryBindings: Bindings
}

export default Settings
export { Bindings }
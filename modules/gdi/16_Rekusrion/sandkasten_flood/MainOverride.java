class MainOverride{
    public static void main(String[] args) {
        MeinFarbeimer.main(args);
        Leinwand.COMMAND_BUFFER.sendCommands("Error: sendCommands called twice");
    }
}
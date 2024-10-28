

class MainOverride {
    public static void main(String[] args) {
        JustAWorld.main(args);
        FloatingWorld.COMMAND_BUFFER.sendCommands("Error: sendCommands called twice");    
    }
}


class MainOverride {
    public static void main(String[] args) {
        FinalRef.main(args);

        Graphics2D.instance().drawImage(TreeLibrary.STAGE, 0, 0);
        Graphics2D.instance().render();
        
        Graphics2D.COMMAND_BUFFER.sendCommands("Error: sendCommands called twice");    
    }
}
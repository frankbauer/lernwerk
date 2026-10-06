class MainOverride {
    public static void main(String[] args) {
        // the stage first: the scene is also rendered while Wald.main runs (after each new tree and each change of
        // a tree's season, inserted by common/canvas.js before the run), so every change is shown in turn
        Graphics2D.instance().drawImage(TreeLibrary.STAGE, 0, 0);
        Wald.main(args);
        Graphics2D.instance().render();

        Graphics2D.COMMAND_BUFFER.sendCommands("Error: sendCommands called twice");    
    }
}

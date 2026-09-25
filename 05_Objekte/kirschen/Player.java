class Player {
    public Player() {
        FloatingWorld.players.add(this);
        FloatingWorld.instructions.add("[\"A\"]");
    }

    public int getID() {
        return FloatingWorld.players.indexOf(this);
    }

    public void moveLeft() {
        FloatingWorld.instructions.add("[\"M\", " + getID() + ", -100]");
    }

    public void moveRight() {
        FloatingWorld.instructions.add("[\"M\", " + getID() + ", 100]");
    }
}

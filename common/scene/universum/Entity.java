class Entity {
    protected static int LAST_ID = 0;
    protected final int id;
    protected double x, y;

    public Entity() {
        this.id = ++LAST_ID;
    }

    protected String toJson() {
        return "{}";
    }
}

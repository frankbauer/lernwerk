class Planet extends Entity {
    private final int type;
    private boolean hasClouds;

    public Planet(int type) {
        if (type != Type.M) {
            System.err.println("Invalid planet type!");
        } else {
            Universe.commands.add("{\"command\":\"Planet\", \"type\": " + type + ", \"id\": " + id + "}");
        }
        this.type = type;
    }

    public void setLocation(double x, double y) {
        Universe.commands.add("{\"command\":\"setLocation\", \"x\": " + x + ", \"y\": " + y + ", \"id\": " + id + "}");
        this.x = x;
        this.y = y;
    }

    public void setHasClouds(boolean hasClouds) {
        Universe.commands.add("{\"command\":\"setHasClouds\", \"hasClouds\": " + hasClouds + ", \"id\": " + id + "}");
        this.hasClouds = hasClouds;
    }

    protected String toJson() {
        return "{\"class\":\"Planet\", \"type\": " + type + ", \"x\": " + x + ", \"y\": " + y + ", \"hasClouds\": " + hasClouds + ", \"id\": " + id + "}";
    }
}

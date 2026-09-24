class Rocket extends Entity {
    private Planet planet;
    private int launchTime;

    public Rocket() {
        Universe.commands.add("{\"command\":\"Rocket\", \"id\": " + id + "}");
    }

    public void setLocationRelativeTo(Planet planet, double offsetX, double offsetY) {
        Universe.commands.add("{\"command\":\"setLocationRelativeTo\", \"planet\": " + planet.id + ", \"offsetX\": " + offsetX + ", \"offsetY\": " + offsetY + ", \"id\": " + id + "}");
        this.planet = planet;
        this.x = planet.x + offsetX;
        this.y = planet.y + offsetY;
    }

    public void launchIn(int seconds) {
        Universe.commands.add("{\"command\":\"launchIn\", \"seconds\": " + seconds + ", \"id\": " + id + "}");
        this.launchTime = seconds;
    }

    protected String toJson() {
        double x = this.x;
        double y = this.y;
        if (planet != null) {
            x += planet.x;
            y += planet.y;
        }
        return "{\"class\":\"Rocket\", \"x\": " + x + ", \"y\": " + y + ", \"launchTime\": " + launchTime + ", \"id\": " + id + "}";
    }
}

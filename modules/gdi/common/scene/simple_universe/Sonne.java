class Sonne {
    public Sonne(){
        this(null);
    }

    public Sonne(Universum u){
        this.universum = u;
        this.holoId = HoloScene.create("Sonne", u != null ? u.holoId : -1);
        if (u != null) {
            u.registerSonne(this);
        }
    }

    public void print(){
        print(null);
    }

    public void print(String indent){
        if (indent == null) {
            indent = "";
        }
        HoloScene.print(holoId);
        System.out.println(indent + "Sonnen-System");
        for (Planet p : planeten){
            p.print(indent + "  ");
        }
    }

    private final java.util.List<Planet> planeten = new java.util.LinkedList<>();
    private final Universum universum;
    // id of this sun in the hologram playground (HoloScene)
    final int holoId;
    void registerPlanet(Planet p){
        planeten.add(p);
    }
}

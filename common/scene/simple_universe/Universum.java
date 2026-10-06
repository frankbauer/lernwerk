class Universum {
    private final java.util.List<Sonne> sonnen = new java.util.LinkedList<>();
    // id of this universe in the hologram playground (HoloScene)
    final int holoId = HoloScene.create("Universum", -1);

    void registerSonne(Sonne s){
        sonnen.add(s);
    }

    public void print(){
        HoloScene.print(holoId);
        System.out.println("Universum");
        sonnen.forEach(s -> s.print("  "));
    }
}

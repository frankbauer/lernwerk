class Universum {
    private static final java.util.List<Sonne> sonnen = new java.util.LinkedList<>();    

    void registerSonne(Sonne s){
        sonnen.add(s);
    }

    public void print(){
        System.out.println("Universum");
        sonnen.forEach(s -> s.print("  "));
    }
}

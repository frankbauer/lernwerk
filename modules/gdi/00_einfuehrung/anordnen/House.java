class House {
    private String town = "?";
    private int floors = 0;

    void setTown(String town) {
        this.town = town;
    }

    void addFloor(Floor floor) {
        floors++;
        System.out.println("Haus in " + town + ": Stockwerk " + floor.getNumber() + " hinzugefügt (" + floors + " Stockwerk(e) insgesamt)");
    }
}

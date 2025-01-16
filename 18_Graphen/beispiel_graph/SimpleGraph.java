public class SimpleGraph {
    public static void main(String[] args){
        //Erstellen eines neuen Graphen mit Elementen
        //vom Datentyp "String"
        Graph<String> g = new Graph<>();

        //Hinzufuegen von 5 Knoten zum Graphen g
        g.add("Berlin"); g.add("Amsterdam"); 
        g.add("London"); g.add("Paris"); g.add("Rom");

        //Fuegt eine gerichtete Kante von "Berlin" 
        //nach "Amsterdam" mit Gewicht 1 hinzu
        g.addEdge("Berlin", "Amsterdam");
        //Fuegt eine gerichtete Kante von "Amsterdam"
        //nach "Berlin" mit Gewicht 1 hinzu
        g.addEdge("Amsterdam", "Berlin");

        //Hinzufuegen weiterer Kanten
        g.addEdge("Paris", "Amsterdam");
        g.addEdge("Amsterdam", "Paris");

        g.addEdge("London", "Amsterdam");
        g.addEdge("Amsterdam", "London");

        g.addEdge("Berlin", "Paris");
        g.addEdge("Paris", "Berlin");

        g.addEdge("Berlin", "Rom");
        g.addEdge("Rom", "Berlin");

        //Visualisierung des Graphen:
        //die Position der Knoten kann per Drag & Drop
        //geaendert werden     
        g.visualize();
    }
}

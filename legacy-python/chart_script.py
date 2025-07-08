import plotly.graph_objects as go

# Create the architecture diagram
fig = go.Figure()

# Define layer positions and colors
layer_colors = ['#1FB8CD', '#FFC185', '#ECEBD5']  # Using brand colors

# Add background rectangles for each layer
fig.add_shape(type="rect", x0=0, y0=3, x1=10, y1=4,
              fillcolor=layer_colors[0], opacity=0.3, line=dict(width=0))

fig.add_shape(type="rect", x0=0, y0=1.5, x1=10, y1=2.5,
              fillcolor=layer_colors[1], opacity=0.3, line=dict(width=0))

fig.add_shape(type="rect", x0=0, y0=0, x1=10, y1=1,
              fillcolor=layer_colors[2], opacity=0.3, line=dict(width=0))

# Top Layer - Generator Bundles
# JSON Files boxes
fig.add_shape(type="rect", x0=0.5, y0=3.2, x1=2.5, y1=3.8,
              fillcolor=layer_colors[0], line=dict(color="white", width=2))
fig.add_shape(type="rect", x0=3, y0=3.2, x1=5, y1=3.8,
              fillcolor=layer_colors[0], line=dict(color="white", width=2))

# Assets boxes
fig.add_shape(type="rect", x0=6, y0=3.2, x1=7.5, y1=3.8,
              fillcolor=layer_colors[0], line=dict(color="white", width=2))
fig.add_shape(type="rect", x0=8, y0=3.2, x1=9.5, y1=3.8,
              fillcolor=layer_colors[0], line=dict(color="white", width=2))

# Middle Layer - Core Components boxes
core_components = [
    {"name": "Bundle<br>Loader", "x": 1, "y": 2},
    {"name": "Rule<br>Processor", "x": 3, "y": 2},
    {"name": "Variable<br>Manager", "x": 5, "y": 2},
    {"name": "Asset<br>Manager", "x": 7.5, "y": 2}
]

for comp in core_components:
    fig.add_shape(type="rect", x0=comp["x"]-0.7, y0=comp["y"]-0.2, 
                  x1=comp["x"]+0.7, y1=comp["y"]+0.2,
                  fillcolor=layer_colors[1], line=dict(color="white", width=2))

# Bottom Layer - Output Generation boxes
output_components = [
    {"name": "Text<br>Generation", "x": 2, "y": 0.5},
    {"name": "Asset<br>Integration", "x": 5, "y": 0.5},
    {"name": "Export<br>Options", "x": 8, "y": 0.5}
]

for comp in output_components:
    fig.add_shape(type="rect", x0=comp["x"]-0.8, y0=comp["y"]-0.2, 
                  x1=comp["x"]+0.8, y1=comp["y"]+0.2,
                  fillcolor=layer_colors[2], line=dict(color="white", width=2))

# Add arrows showing data flow - Top to Middle
fig.add_annotation(x=1, y=2.2, ax=1.5, ay=3.2,
                  arrowhead=2, arrowsize=1.5, arrowwidth=3, arrowcolor="#5D878F",
                  showarrow=True, text="", axref="x", ayref="y")

fig.add_annotation(x=3, y=2.2, ax=4, ay=3.2,
                  arrowhead=2, arrowsize=1.5, arrowwidth=3, arrowcolor="#5D878F",
                  showarrow=True, text="", axref="x", ayref="y")

fig.add_annotation(x=7.5, y=2.2, ax=6.75, ay=3.2,
                  arrowhead=2, arrowsize=1.5, arrowwidth=3, arrowcolor="#5D878F",
                  showarrow=True, text="", axref="x", ayref="y")

fig.add_annotation(x=7.5, y=2.2, ax=8.75, ay=3.2,
                  arrowhead=2, arrowsize=1.5, arrowwidth=3, arrowcolor="#5D878F",
                  showarrow=True, text="", axref="x", ayref="y")

# Add arrows showing data flow - Middle to Bottom
fig.add_annotation(x=2, y=0.7, ax=1, ay=1.8,
                  arrowhead=2, arrowsize=1.5, arrowwidth=3, arrowcolor="#5D878F",
                  showarrow=True, text="", axref="x", ayref="y")

fig.add_annotation(x=2, y=0.7, ax=3, ay=1.8,
                  arrowhead=2, arrowsize=1.5, arrowwidth=3, arrowcolor="#5D878F",
                  showarrow=True, text="", axref="x", ayref="y")

fig.add_annotation(x=5, y=0.7, ax=5, ay=1.8,
                  arrowhead=2, arrowsize=1.5, arrowwidth=3, arrowcolor="#5D878F",
                  showarrow=True, text="", axref="x", ayref="y")

fig.add_annotation(x=8, y=0.7, ax=7.5, ay=1.8,
                  arrowhead=2, arrowsize=1.5, arrowwidth=3, arrowcolor="#5D878F",
                  showarrow=True, text="", axref="x", ayref="y")

# Layer titles
fig.add_trace(go.Scatter(x=[5], y=[4.2], mode='text', 
                        text=['Generator Bundles'], textfont=dict(size=18, color='black'),
                        showlegend=False))

fig.add_trace(go.Scatter(x=[5], y=[2.7], mode='text', 
                        text=['Randomizer Engine Core'], textfont=dict(size=18, color='black'),
                        showlegend=False))

fig.add_trace(go.Scatter(x=[5], y=[1.2], mode='text', 
                        text=['Output Generation'], textfont=dict(size=18, color='black'),
                        showlegend=False))

# Top layer component labels - JSON files and assets
fig.add_trace(go.Scatter(x=[1.5], y=[3.5], mode='text', 
                        text=['televangelist_<br>generator.json'], 
                        textfont=dict(size=11, color='white'), showlegend=False))

fig.add_trace(go.Scatter(x=[4], y=[3.5], mode='text', 
                        text=['satanic_panic_<br>generator.json'], 
                        textfont=dict(size=11, color='white'), showlegend=False))

fig.add_trace(go.Scatter(x=[6.75], y=[3.5], mode='text', 
                        text=['Images'], 
                        textfont=dict(size=12, color='white'), showlegend=False))

fig.add_trace(go.Scatter(x=[8.75], y=[3.5], mode='text', 
                        text=['Audio/<br>Fonts'], 
                        textfont=dict(size=11, color='white'), showlegend=False))

# Middle layer component labels
fig.add_trace(go.Scatter(x=[comp["x"] for comp in core_components], 
                        y=[comp["y"] for comp in core_components], 
                        mode='text', 
                        text=[comp["name"] for comp in core_components],
                        textfont=dict(size=11, color='white'), showlegend=False))

# Bottom layer component labels
fig.add_trace(go.Scatter(x=[comp["x"] for comp in output_components], 
                        y=[comp["y"] for comp in output_components], 
                        mode='text', 
                        text=[comp["name"] for comp in output_components],
                        textfont=dict(size=11, color='white'), showlegend=False))

# Key process labels - positioned near relevant components
fig.add_trace(go.Scatter(x=[3], y=[1.3], mode='text', 
                        text=['Weighted Selection'], 
                        textfont=dict(size=12, color='#964325'), showlegend=False))

fig.add_trace(go.Scatter(x=[5], y=[1.3], mode='text', 
                        text=['Conditional Logic'], 
                        textfont=dict(size=12, color='#964325'), showlegend=False))

fig.add_trace(go.Scatter(x=[7], y=[1.3], mode='text', 
                        text=['Variable Sub'], 
                        textfont=dict(size=12, color='#964325'), showlegend=False))

# Configure layout
fig.update_layout(
    title="Randomizer Engine Architecture",
    xaxis=dict(range=[-0.5, 10.5], showgrid=False, showticklabels=False, zeroline=False),
    yaxis=dict(range=[-0.2, 4.5], showgrid=False, showticklabels=False, zeroline=False),
    plot_bgcolor='white',
    showlegend=False
)

# Save the chart
fig.write_image("randomizer_engine_architecture.png")
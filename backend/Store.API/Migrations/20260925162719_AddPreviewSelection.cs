using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Store.API.Migrations
{
    /// <inheritdoc />
    public partial class AddPreviewSelection : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "PreviewSelection",
                table: "projects",
                type: "jsonb",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "PreviewSelection",
                table: "projects");
        }
    }
}
